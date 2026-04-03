const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

let resend = null;

// Initialize Resend only if API key is available
if (process.env.RESEND_API_KEY) {
    const { Resend } = require('resend');
    resend = new Resend(process.env.RESEND_API_KEY);
}

// Login Check Route (Check by phone number)
router.post('/check-user', async (req, res) => {
    const { phone } = req.body;
    try {
        const result = await db.query('SELECT id, name, phone, email, password_hash FROM customers WHERE phone = $1', [phone]);
        if (result.rows.length === 0) {
            // Check if user is an admin (in users table)
            const adminResult = await db.query('SELECT id, username, phone, email, password_hash FROM users WHERE phone = $1', [phone]);
            if (adminResult.rows.length === 0) {
                return res.status(404).json({ exists: false, message: 'User not found' });
            }
            return res.json({ exists: true, userType: 'admin', user: adminResult.rows[0], needsPassword: !!adminResult.rows[0].password_hash });
        }
        const user = result.rows[0];
        return res.json({ exists: true, userType: 'customer', user, needsPassword: !!user.password_hash });
    } catch (error) {
        console.error('CHECK USER ERROR:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Password Login Route
router.post('/login-password', async (req, res) => {
    const { phone, password } = req.body;
    try {
        // Find in customers or users
        let userResult = await db.query('SELECT * FROM customers WHERE phone = $1', [phone]);
        let userType = 'customer';
        if (userResult.rows.length === 0) {
            userResult = await db.query('SELECT * FROM users WHERE phone = $1', [phone]);
            userType = 'admin';
        }

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username || user.name, role: user.role || 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name || user.username, role: user.role || 'customer' } });
    } catch (error) {
        console.error('PASS LOGIN ERROR:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Send OTP Route
router.post('/send-otp', async (req, res) => {
    const { email, phone } = req.body;
    try {
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

        // ALWAYS log OTP to console for debugging
        console.log('\n========================================');
        console.log(`✓ OTP Generated for ${emailToUse}`);
        console.log(`📧 OTP Code: ${otp}`);
        console.log(`⏰ Expires in: 10 minutes`);
        console.log('========================================\n');

        // Try to send via Resend if available, but don't fail if it doesn't work
        if (resend) {
            try {
                const { data, error } = await resend.emails.send({
                    from: 'MutantModz <onboarding@resend.dev>', // Using default Resend test domain
                    to: [emailToUse],
                    subject: 'Your MutantModz Login OTP',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #dc2626;">Your Login Code</h2>
                            <p style="font-size: 16px;">Your one-time password is:</p>
                            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                                <h1 style="margin: 0; font-size: 32px; letter-spacing: 5px; color: #dc2626;">${otp}</h1>
                            </div>
                            <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
                            <p style="color: #999; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
                        </div>
                    `
                });

                if (!error && data) {
                    console.log('✓ Email sent successfully via Resend');
                } else if (error) {
                    console.warn('⚠ Resend email failed, but OTP is available in console above');
                }
            } catch (emailError) {
                console.warn('⚠ Resend attempt failed:', emailError.message);
                console.log('💡 Check console above for OTP code');
            }
        } else {
            console.log('💡 Resend not configured. Check console above for OTP code.');
        }

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('SEND OTP ERROR:', error);
        res.status(500).json({ error: 'Server error' });
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
