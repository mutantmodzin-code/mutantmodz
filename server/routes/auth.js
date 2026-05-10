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
                user: { id: user.id, name: user.name, email: user.email, phone: user.phone } 
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

        if (!user.otp_hash || new Date() > user.otp_expiry) {
            return res.status(400).json({ error: 'OTP expired or not found' });
        }

        const isMatch = await bcrypt.compare(otp, user.otp_hash);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid code' });
        }

        // Clear OTP on success and mark customer as verified if applicable
        if (!user.role || user.role === 'customer') {
            await db.query('UPDATE customers SET otp_hash = NULL, otp_expiry = NULL, is_verified = TRUE WHERE id = $1', [user.id]);
        } else {
            await db.query('UPDATE ' + (user.role ? 'users' : 'customers') + ' SET otp_hash = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);
        }

        const token = jwt.sign({ id: user.id, username: user.username || user.name, role: user.role || 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                name: user.name || user.username, 
                email: user.email,
                phone: user.phone,
                role: user.role || 'customer' 
            } 
        });
    } catch (error) {
        console.error('VERIFY OTP ERROR:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        console.log('🔓 Auth failed: No token provided');
        return res.sendStatus(401);
    }

    if (!process.env.JWT_SECRET) {
        console.error('❌ CRITICAL: JWT_SECRET is missing from environment variables');
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('🚫 JWT Verification Error:', err.message);
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// Send OTP for Email Update (Both formats for compatibility)
const handleSendEmailOTP = async (req, res) => {
    const { newEmail, userId, phone } = req.body;
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_hash = await bcrypt.hash(otp, 10);
        const otp_expiry = new Date(Date.now() + 10 * 60000);

        // Allow identification by phone OR userId
        if (phone) {
            await db.query(
                'UPDATE customers SET otp_hash = $1, otp_expiry = $2, pending_email = $3 WHERE phone = $4',
                [otp_hash, otp_expiry, newEmail, phone]
            );
        } else {
            await db.query(
                'UPDATE customers SET otp_hash = $1, otp_expiry = $2, pending_email = $3 WHERE id = $4',
                [otp_hash, otp_expiry, newEmail, userId]
            );
        }

        const resendInstance = getResend();
        if (!resendInstance) {
            console.log(`[DEV MODE] OTP for Email Update to ${newEmail}: ${otp}`);
            return res.json({ dev: true, message: 'OTP sent to terminal (Mock Mode)' });
        }

        try {
            const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
            await resendInstance.emails.send({
                from: fromEmail,
                to: [newEmail],
                subject: 'MutantModz Email Verification',
                html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                        <h2>Verify Your New Email</h2>
                        <h1 style="color: #ff0000;">${otp}</h1>
                        <p>Enter this code to confirm your email address change.</p>
                    </div>
                `
            });
            res.json({ message: 'Verification code sent to your new email.' });
        } catch (mailError) {
            console.error('MAILER ERROR:', mailError);
            res.status(500).json({ error: 'Failed to send verification email' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

router.post('/send-email-update-otp', handleSendEmailOTP);
router.post('/send_email_update_otp', handleSendEmailOTP);

// Verify Email Update OTP (Both formats)
const handleVerifyEmailOTP = async (req, res) => {
    const { userId, phone, otp } = req.body;
    try {
        let result;
        if (phone) {
            result = await db.query('SELECT * FROM customers WHERE phone = $1', [phone]);
        } else {
            result = await db.query('SELECT * FROM customers WHERE id = $1', [userId]);
        }
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const user = result.rows[0];
        if (!user.otp_hash || new Date() > user.otp_expiry) {
            return res.status(400).json({ error: 'Verification code expired' });
        }

        const isMatch = await bcrypt.compare(otp, user.otp_hash);
        if (!isMatch) return res.status(400).json({ error: 'Invalid verification code' });

        // Update email and clear pending fields
        await db.query(
            'UPDATE customers SET email = pending_email, pending_email = NULL, otp_hash = NULL, otp_expiry = NULL WHERE id = $1',
            [user.id]
        );

        res.json({ message: 'Email updated successfully', newEmail: user.pending_email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

router.post('/verify-email-update-otp', handleVerifyEmailOTP);
router.post('/verify_email_update_otp', handleVerifyEmailOTP);


module.exports = router;
module.exports.authenticateToken = authenticateToken;
