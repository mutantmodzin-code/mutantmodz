const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');

// Initialize Resend with API key (lazy initialization)
let resendClient = null;

function getResend() {
    if (!resendClient && process.env.RESEND_API_KEY) {
        console.log('🔌 Initializing Resend with API key');
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
}


// Login Check Route (Direct Login - OTP removed)
router.post('/check-user', async (req, res) => {
    const { phone } = req.body;
    try {
        const result = await db.query('SELECT * FROM customers WHERE phone = $1', [phone]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            // Provide token immediately (OTP Bypass)
            const token = jwt.sign({ 
                id: user.id, 
                username: user.name, 
                role: 'customer' 
            }, process.env.JWT_SECRET, { expiresIn: '7d' });

            res.json({ 
                exists: true, 
                token: token,
                user: { id: user.id, name: user.name, email: user.email } 
            });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        console.error('CHECK USER ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});


// Send OTP Route
router.post('/send-otp', async (req, res) => {
    const { email, phone } = req.body;
    try {
        console.log(`📧 OTP REQUEST for ${email || phone}`);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_hash = await bcrypt.hash(otp, 10);
        const otp_expiry = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Store OTP in database (either for customer or user)
        let userResult = await db.query('SELECT * FROM customers WHERE phone = $1 OR email = $2', [phone, email]);
        let tableName = 'customers';
        
        if (userResult.rows.length === 0) {
            userResult = await db.query('SELECT * FROM users WHERE phone = $1 OR email = $2', [phone, email]);
            tableName = 'users';
        }

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User/Customer not found to send OTP' });
        }

        const user = userResult.rows[0];
        const emailToUse = email || user.email;

        await db.query('UPDATE ' + tableName + ' SET otp_hash = $1, otp_expiry = $2 WHERE id = $3', [otp_hash, otp_expiry, user.id]);

        if (!emailToUse) {
            return res.status(400).json({ error: 'User does not have an email linked for OTP' });
        }

        // Send OTP via Resend or Fallback to Console
        const resendInstance = getResend();
        if (!resendInstance) {
            console.log('--- OTP BYPASS (MOCK MODE) ---');
            console.log(`[DEV MODE] OTP CODE for ${emailToUse}: ${otp}`);
            console.log('------------------------------');
            return res.json({ 
                dev: true, 
                message: 'OTP sent to terminal (Mock Mode active)' 
            });
        }

        try {
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
            const { error } = await resendInstance.emails.send({
                from: fromEmail,
                to: [emailToUse],
                subject: 'MutantModz Verification Code',
                html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                        <h2>Your Verification Code</h2>
                        <h1 style="color: #ff0000;">${otp}</h1>
                        <p>This code expires in 10 minutes.</p>
                    </div>
                `
            });

            if (error) {
                console.error('RESEND ERROR:', error);
                console.log(`[EMERGENCY FALLBACK] OTP CODE for ${emailToUse}: ${otp}`);
                return res.json({ 
                    dev: true, 
                    message: 'Authentication protocol initiated. OTP printed to terminal due to mailer status.' 
                });
            }

            console.log(`✓ OTP sent via Resend to ${emailToUse}`);
            res.json({ message: 'Identity verification code sent to your email.' });
        } catch (mailError) {
            console.error('MAILER EXCEPTION:', mailError);
            console.log(`[CRITICAL FALLBACK] OTP CODE for ${emailToUse}: ${otp}`);
            return res.json({ 
                dev: true, 
                message: 'Processing error. OTP sent to local terminal.' 
            });
        }
    } catch (err) {
        console.error('SEND OTP SYSTEM ERROR:', err);
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

        // Master OTP for Dev Mode
        if (otp === '000000') {
             console.log(`🛡️ Dev Mode Bypass for ${user.email}`);
        } else {
            if (!user.otp_hash || new Date() > user.otp_expiry) {
                return res.status(400).json({ error: 'OTP expired or not found' });
            }

            const isMatch = await bcrypt.compare(otp, user.otp_hash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid code' });
            }
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
