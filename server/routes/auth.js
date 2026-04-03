const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

// Initialize Resend with API key (lazy initialization)
let resend = null;

function getResend() {
    if (!resend && process.env.RESEND_API_KEY) {
        console.log('🔌 Initializing Resend with API key');
        resend = new Resend(process.env.RESEND_API_KEY);
    } else if (!process.env.RESEND_API_KEY) {
        console.warn('⚠️ RESEND_API_KEY not found in environment variables');
    }
    return resend;
}


// Login Check Route (Check by phone number)
// Always requires OTP verification
router.post('/check-user', async (req, res) => {
    const { phone } = req.body;
    try {
        const result = await db.query('SELECT id, name, phone, email FROM customers WHERE phone = $1', [phone]);
        if (result.rows.length === 0) {
            // Check if user is an admin (in users table)
            const adminResult = await db.query('SELECT id, username, phone, email FROM users WHERE phone = $1', [phone]);
            if (adminResult.rows.length === 0) {
                return res.status(404).json({ exists: false, message: 'User not found' });
            }
            return res.json({ exists: true, userType: 'admin', user: adminResult.rows[0] });
        }
        const user = result.rows[0];
        return res.json({ exists: true, userType: 'customer', user });
    } catch (error) {
        console.error('CHECK USER ERROR:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send OTP Route
router.post('/send-otp', async (req, res) => {
    const { email, phone } = req.body;
    try {
        console.log('📧 Send-OTP endpoint called');
        console.log('RESEND_API_KEY at runtime:', process.env.RESEND_API_KEY ? 'PRESENT' : 'MISSING');
        
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_hash = await bcrypt.hash(otp, 10);
        const otp_expiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Find user by phone OR email
        let query = 'UPDATE customers SET otp_hash = $1, otp_expiry = $2 WHERE phone = $3 OR email = $4 RETURNING *';
        let result = await db.query(query, [otp_hash, otp_expiry, phone, email]);

        if (result.rows.length === 0) {
            query = 'UPDATE users SET otp_hash = $1, otp_expiry = $2 WHERE phone = $3 OR email = $4 RETURNING *';
            result = await db.query(query, [otp_hash, otp_expiry, phone, email]);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];
        const emailToUse = email || user.email;

        if (!emailToUse) {
            return res.status(400).json({ error: 'User does not have an email linked for OTP' });
        }

        // Send OTP via Resend
        const resendClient = getResend();
        if (!resendClient) {
            console.error('RESEND NOT CONFIGURED');
            return res.status(500).json({ error: 'Email service not configured. Please contact support.' });
        }

        const { data, error } = await resendClient.emails.send({
            from: 'onboarding@resend.dev',  // Using Resend onboarding domain (verified for testing)
            to: [emailToUse],
            subject: 'Your MutantModz Login OTP',
            html: `
                <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <h2 style="color: #dc2626; margin-top: 0; text-align: center;">Your Login Code</h2>
                        <p style="font-size: 16px; color: #333; text-align: center;">Your one-time password is:</p>
                        
                        <div style="background: #f3f4f6; padding: 25px; border-radius: 8px; text-align: center; margin: 25px 0; border: 2px solid #dc2626;">
                            <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; color: #dc2626; font-weight: bold;">${otp}</h1>
                        </div>
                        
                        <p style="color: #666; font-size: 14px; text-align: center;">
                            <strong>⏰ This code expires in 10 minutes</strong>
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        
                        <p style="color: #999; font-size: 12px; margin-bottom: 0;">
                            If you didn't request this code, please ignore this email. Your account is secure.
                        </p>
                        
                        <div style="text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                            <p style="color: #999; font-size: 11px; margin: 0;">
                                © 2026 MutantModz. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        if (error) {
            console.error('RESEND ERROR:', error);
            return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
        }

        console.log(`✓ OTP sent successfully to ${emailToUse}`);
        res.json({ message: 'OTP sent successfully to your email' });
    } catch (error) {
        console.error('SEND OTP ERROR:', error);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// Verify OTP Route
router.post('/verify-otp', async (req, res) => {
    const { phone, email, otp } = req.body;
    try {
        let query = 'SELECT * FROM customers WHERE phone = $1 OR email = $2';
        let result = await db.query(query, [phone, email]);

        if (result.rows.length === 0) {
            query = 'SELECT * FROM users WHERE phone = $1 OR email = $2';
            result = await db.query(query, [phone, email]);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (new Date() > user.otp_expiry) {
            return res.status(400).json({ error: 'OTP expired' });
        }

        const isMatch = await bcrypt.compare(otp, user.otp_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Clear OTP on success
        await db.query('UPDATE ' + (user.role ? 'users' : 'customers') + ' SET otp_hash = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);

        const token = jwt.sign({ id: user.id, username: user.username || user.name, role: user.role || 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name || user.username, role: user.role || 'customer' } });
    } catch (error) {
        console.error('VERIFY OTP ERROR:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Simple Login Route (Keeping old one for backward compatibility if needed, but updating it)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('AUTH ERROR:', error);
        res.status(500).json({ error: 'Server error', details: error.message });
    }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

module.exports = router;
module.exports.authenticateToken = authenticateToken;
