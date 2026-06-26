const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Resend } = require('resend');
const {
    OTP_PROTECTION_MIDDLEWARE,
    checkIPBlockStatus,
    checkHoneypot,
    recordFailedAttempt,
    generateSecureOTP,
    hashOTP,
    setSecureSessionCookie,
    clearSecureSessionCookie,
    logSecurityEvent,
    // Enterprise utilities
    sendSecurityEmail,
    getGeoIPData,
    isDatacenterIP,
    checkImpossibleTravel,
    checkPwnedPassword,
    calculateRiskScore,
    writeSecurityEvent
} = require('../utils/security');
const redis = require('../utils/redis');
const {
    indiaAccessPolicy,
    behavioralCheck
} = require('../middleware/enterpriseSecurity');

// Initialize Resend with API key
let resendClient = null;
function getResend() {
    if (!resendClient && process.env.RESEND_API_KEY) {
        resendClient = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClient;
}

// User-Agent parser utility
function parseUA(userAgent) {
    let browser = 'Unknown Browser';
    let os = 'Unknown OS';

    if (/chrome|crios/i.test(userAgent) && !/edge|edg/i.test(userAgent) && !/opr|opera/i.test(userAgent)) {
        browser = 'Chrome';
    } else if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
        browser = 'Safari';
    } else if (/firefox|fxios/i.test(userAgent)) {
        browser = 'Firefox';
    } else if (/edge|edg/i.test(userAgent)) {
        browser = 'Edge';
    } else if (/opr|opera/i.test(userAgent)) {
        browser = 'Opera';
    }

    if (/windows/i.test(userAgent)) {
        os = 'Windows';
    } else if (/macintosh|mac os x/i.test(userAgent) && !/ipad|iphone|ipod/i.test(userAgent)) {
        os = 'macOS';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
        os = 'iOS';
    } else if (/android/i.test(userAgent)) {
        os = 'Android';
    } else if (/linux/i.test(userAgent)) {
        os = 'Linux';
    }

    return { browser, os };
}

// Hash refresh tokens
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

// Create a database session record
async function createSession(userId, userRole, refreshToken, req, geoData) {
    const sessionId = crypto.randomUUID();
    const tokenHash = hashToken(refreshToken);
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const { browser, os } = parseUA(userAgent);
    
    const deviceId = req.body.deviceId || crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex').slice(0, 32);
    const country = geoData ? geoData.country : 'IN';
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days

    await db.query(
        `INSERT INTO sessions (session_id, user_id, user_role, refresh_token_hash, device_id, browser, ip, country, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [sessionId, userId, userRole, tokenHash, deviceId, `${browser} (${os})`, ip, country, expiresAt]
    );

    return sessionId;
}

// Verify Google reCAPTCHA v2 token (legacy compatibility)
async function verifyRecaptcha(token) {
    if (!token) return false;
    const secret = process.env.RECAPTCHA_SECRET_KEY;
    if (!secret) {
        if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development') {
            return true;
        }
        return false;
    }

    try {
        const url = 'https://www.google.com/recaptcha/api/siteverify';
        const params = new URLSearchParams();
        params.append('secret', secret);
        params.append('response', token);

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });

        if (!response.ok) return false;
        const data = await response.json();
        
        if (data.success === true) return true;

        const errorCodes = data['error-codes'] || [];
        const isLocalOrPreview = process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development' || !process.env.VERCEL;
        if (isLocalOrPreview || errorCodes.includes('domain-not-allowed') || errorCodes.includes('invalid-input-secret')) {
            return true;
        }

        return false;
    } catch (err) {
        return false;
    }
}

// Handles device verification and records updates
async function handleDeviceVerification(userId, userRole, deviceMetadata, req, geoData) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const { browser, os } = parseUA(userAgent);

    const deviceId = deviceMetadata.deviceId || crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex').slice(0, 32);
    const timezone = deviceMetadata.timezone || 'Asia/Kolkata';
    const language = deviceMetadata.language || 'en-IN';
    const resolution = deviceMetadata.screenResolution || '1920x1080';
    const country = geoData ? geoData.country : 'IN';

    const checkRes = await db.query(
        `SELECT * FROM trusted_devices WHERE user_id = $1 AND user_role = $2 AND device_id = $3`,
        [userId, userRole, deviceId]
    );

    let isNewDevice = false;
    let isTrusted = false;

    if (checkRes.rows.length === 0) {
        isNewDevice = true;
        isTrusted = userRole === 'customer'; // Auto-trust regular customer on successful OTP verification

        await db.query(
            `INSERT INTO trusted_devices (device_id, user_id, user_role, browser, operating_system, timezone, language, screen_resolution, ip, country, trusted)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [deviceId, userId, userRole, browser, os, timezone, language, resolution, ip, country, isTrusted]
        );
    } else {
        const deviceRecord = checkRes.rows[0];
        isTrusted = deviceRecord.trusted;
        await db.query(
            `UPDATE trusted_devices SET last_seen = CURRENT_TIMESTAMP, ip = $1, country = $2 WHERE id = $3`,
            [ip, country, deviceRecord.id]
        );
    }

    return { isNewDevice, isTrusted, deviceId, browser, os };
}

// Login Check Route
router.post('/check-user', checkIPBlockStatus, checkHoneypot, indiaAccessPolicy, async (req, res) => {
    const { phone } = req.body;
    try {
        const result = await db.query('SELECT * FROM customers WHERE phone = $1', [phone]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.json({ 
                exists: true, 
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
router.post('/send-otp', checkIPBlockStatus, checkHoneypot, indiaAccessPolicy, OTP_PROTECTION_MIDDLEWARE, async (req, res) => {
    const { email, phone } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    try {
        console.log(`📧 OTP REQUEST for ${email || phone}`);
        const otp = generateSecureOTP();
        const otp_hash = await hashOTP(otp);
        const otp_expiry = new Date(Date.now() + 5 * 60000);

        let userResult = await db.query('SELECT * FROM customers WHERE phone = $1 OR email = $2', [phone, email]);
        let tableName = 'customers';
        let userRole = 'customer';
        
        if (userResult.rows.length === 0) {
            userResult = await db.query('SELECT * FROM users WHERE phone = $1 OR email = $2', [phone, email]);
            tableName = 'users';
            userRole = 'admin';
        }

        if (userResult.rows.length === 0) {
            userResult = await db.query('SELECT * FROM pending_registrations WHERE phone = $1 OR email = $2', [phone, email]);
            tableName = 'pending_registrations';
        }

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User/Customer not found to send OTP' });
        }

        const user = userResult.rows[0];
        const emailToUse = email || user.email;

        // Perform enterprise security checks
        const geoData = await getGeoIPData(ip);
        const isDc = isDatacenterIP(geoData);
        
        // Impossible Travel Detection during request stage
        let impossibleTravelRisk = false;
        if (user.id && userRole !== 'pending') {
            const travel = await checkImpossibleTravel(user.id, userRole, geoData.lat, geoData.lon, new Date());
            if (travel.isSuspicious) {
                impossibleTravelRisk = true;
                await writeSecurityEvent({
                    userId: user.id,
                    userRole,
                    eventType: 'Suspicious Impossible Travel',
                    riskScore: 80,
                    ip,
                    country: geoData.country,
                    city: geoData.city,
                    device: 'OTP Request stage',
                    browser: userAgent,
                    status: 'BLOCKED',
                    metadata: { travelDetails: travel }
                });

                if (emailToUse) {
                    await sendSecurityEmail(
                        emailToUse, 
                        'Alert: Suspicious login attempt from another location',
                        `<div style="font-family: sans-serif; padding: 20px; background-color: #09090b; color: white; border-radius: 12px;">
                            <h2>Suspicious Impossible Travel Detected</h2>
                            <p>We blocked an OTP request because of a geographic location conflict.</p>
                            <p>Current request from: <strong>${geoData.city}, ${geoData.country}</strong></p>
                        </div>`
                    );
                }
            }
        }

        // Calculate risk score
        const failedAttempts = parseInt(await redis.get(`failed_attempts:${ip}`) || '0');
        const botCheck = detectBot(req);
        
        const risk = await calculateRiskScore({
            isVPN: geoData.vpn,
            isProxy: geoData.proxy,
            isDatacenter: isDc,
            isHeadless: botCheck.isBot && botCheck.reason.includes('Headless'),
            isBot: botCheck.isBot && !botCheck.reason.includes('Headless'),
            isNonIndia: geoData.country !== 'IN',
            failedAttemptsCount: failedAttempts,
            isTurnstileFailed: impossibleTravelRisk
        });

        if (risk.score >= 70) {
            await writeSecurityEvent({
                userId: user.id || null,
                userRole,
                eventType: 'Blocked Bot',
                riskScore: risk.score,
                ip,
                country: geoData.country,
                city: geoData.city,
                device: 'OTP Request stage',
                browser: userAgent,
                status: 'BLOCKED',
                metadata: { reasons: risk.reasons }
            });
            return res.status(403).json({ error: 'Security threshold exceeded. Request rejected.' });
        }

        await db.query('UPDATE ' + tableName + ' SET otp_hash = $1, otp_expiry = $2 WHERE id = $3', [otp_hash, otp_expiry, user.id]);

        if (!emailToUse) {
            return res.status(400).json({ error: 'User does not have an email linked for OTP' });
        }

        // Send OTP
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
            await resendInstance.emails.send({
                from: fromEmail,
                to: [emailToUse],
                subject: 'MutantModz Verification Code',
                text: `Your MutantModz verification code is: ${otp}. This code expires in 5 minutes.`,
                html: `
                    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
                        <h2>Your Verification Code</h2>
                        <h1 style="color: #ff0000; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
                        <p>This code expires in 5 minutes.</p>
                    </div>
                `
            });

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
router.post('/verify-otp', checkIPBlockStatus, checkHoneypot, indiaAccessPolicy, async (req, res) => {
    const { phone, email, otp, deviceMetadata = {} } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    try {
        let resolvedEmail = email ? email.trim().toLowerCase() : null;
        if (!resolvedEmail && phone) {
            try {
                let checkRes = await db.query('SELECT email FROM customers WHERE phone = $1', [phone]);
                if (checkRes.rows.length > 0) {
                    resolvedEmail = checkRes.rows[0].email;
                } else {
                    checkRes = await db.query('SELECT email FROM users WHERE phone = $1', [phone]);
                    if (checkRes.rows.length > 0) {
                        resolvedEmail = checkRes.rows[0].email;
                    }
                }
            } catch (dbErr) {
                console.error(dbErr);
            }
        }

        let query = 'SELECT * FROM customers WHERE phone = $1 OR email = $2';
        let result = await db.query(query, [phone, email]);
        let isPending = false;
        let userRole = 'customer';

        if (result.rows.length === 0) {
            query = 'SELECT * FROM users WHERE phone = $1 OR email = $2';
            result = await db.query(query, [phone, email]);
            userRole = 'admin';
        }

        if (result.rows.length === 0) {
            query = 'SELECT * FROM pending_registrations WHERE phone = $1 OR email = $2';
            result = await db.query(query, [phone, email]);
            isPending = true;
            userRole = 'customer';
        }

        if (result.rows.length === 0) {
            await recordFailedAttempt(ip, resolvedEmail || 'NONE', userAgent, 'User record not found during OTP verification');
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (!user.otp_hash || new Date() > user.otp_expiry) {
            await recordFailedAttempt(ip, resolvedEmail || 'NONE', userAgent, 'OTP expired or not found');
            return res.status(401).json({ error: 'OTP expired or not found' });
        }

        const isMatch = await bcrypt.compare(otp, user.otp_hash);
        if (!isMatch) {
            await recordFailedAttempt(ip, resolvedEmail || 'NONE', userAgent, 'Invalid OTP code entered');
            return res.status(401).json({ error: 'Invalid verification code' });
        }

        await redis.del(`failed_attempts:${ip}`);

        let authenticatedUser = user;

        if (isPending) {
            const insertResult = await db.query(
                `INSERT INTO customers (name, phone, email, address, is_verified, ip_address, user_agent, browser_fingerprint) 
                 VALUES ($1, $2, $3, $4, TRUE, $5, $6, $7) 
                 RETURNING *`,
                [
                    user.name, 
                    user.phone, 
                    user.email, 
                    user.address || '', 
                    ip, 
                    userAgent, 
                    deviceMetadata.deviceId || ''
                ]
            );
            authenticatedUser = insertResult.rows[0];
            await db.query('DELETE FROM pending_registrations WHERE id = $1', [user.id]);
        } else {
            if (userRole === 'customer') {
                await db.query(
                    `UPDATE customers 
                     SET otp_hash = NULL, otp_expiry = NULL, is_verified = TRUE, 
                         ip_address = $2, user_agent = $3 
                     WHERE id = $1`, 
                    [user.id, ip, userAgent]
                );
            } else {
                await db.query(
                    `UPDATE users 
                     SET otp_hash = NULL, otp_expiry = NULL 
                     WHERE id = $1`, 
                    [user.id]
                );
            }
        }

        // Verify Location & Impossible Travel post-OTP verification
        const geoData = await getGeoIPData(ip);
        const travel = await checkImpossibleTravel(authenticatedUser.id, userRole, geoData.lat, geoData.lon, new Date());
        
        if (travel.isSuspicious) {
            await writeSecurityEvent({
                userId: authenticatedUser.id,
                userRole,
                eventType: 'Suspicious Impossible Travel',
                riskScore: 100,
                ip,
                country: geoData.country,
                city: geoData.city,
                device: 'OTP Verification Stage',
                browser: userAgent,
                status: 'BLOCKED',
                metadata: { travelDetails: travel }
            });

            if (authenticatedUser.email) {
                await sendSecurityEmail(
                    authenticatedUser.email, 
                    'Urgent: Blocked Access Attempt',
                    `<div style="font-family: sans-serif; padding: 20px; background-color: #7f1d1d; color: white; border-radius: 12px;">
                        <h2>Impossible Travel Blocked</h2>
                        <p>We blocked access from a location incompatible with your previous session.</p>
                        <p>Access from: <strong>${geoData.city}, ${geoData.country}</strong></p>
                    </div>`
                );
            }

            return res.status(403).json({ error: 'Travel anomaly detected. Access denied.' });
        }

        // Verify Device Trusted Status
        const { isNewDevice, isTrusted, deviceId, browser, os } = await handleDeviceVerification(
            authenticatedUser.id, 
            userRole, 
            deviceMetadata, 
            req, 
            geoData
        );

        if (isNewDevice && authenticatedUser.email) {
            await sendSecurityEmail(
                authenticatedUser.email,
                'New Device Authorized',
                `<div style="font-family: sans-serif; padding: 20px; background-color: #09090b; color: white; border-radius: 12px;">
                    <h2>New Device Associated</h2>
                    <p>A new device has been trusted on your account.</p>
                    <ul>
                        <li>Device ID: ${deviceId.slice(0, 10)}</li>
                        <li>Browser/OS: ${browser} / ${os}</li>
                        <li>Location: ${geoData.city}, ${geoData.country}</li>
                    </ul>
                </div>`
            );
        }

        // Generate rotated token pair
        const accessToken = jwt.sign(
            { id: authenticatedUser.id, username: authenticatedUser.username || authenticatedUser.name, role: userRole }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        const refreshToken = crypto.randomBytes(40).toString('hex');

        // Store session record in DB
        await createSession(authenticatedUser.id, userRole, refreshToken, req, geoData);

        // Set secure cookies
        setSecureSessionCookie(res, accessToken);

        // Log security audit event
        await writeSecurityEvent({
            userId: authenticatedUser.id,
            userRole,
            eventType: 'Login Success',
            riskScore: isNewDevice ? 20 : 0,
            ip,
            country: geoData.country,
            city: geoData.city,
            device: `${browser} (${os})`,
            browser: userAgent,
            status: 'SUCCESS',
            metadata: { method: 'otp', deviceId }
        });

        res.json({ 
            token: accessToken, 
            refreshToken,
            user: { 
                id: authenticatedUser.id, 
                name: authenticatedUser.name || authenticatedUser.username, 
                email: authenticatedUser.email,
                phone: authenticatedUser.phone,
                role: userRole 
            } 
        });
    } catch (error) {
        console.error('VERIFY OTP ERROR:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Logout Route
router.post('/logout', authenticateToken, async (req, res) => {
    clearSecureSessionCookie(res);
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token) {
            // Delete current session if token matches
            const decoded = jwt.decode(token);
            if (decoded) {
                // If storing tokens globally we'd delete the specific row here
            }
        }
    } catch (err) {
        // Safe check
    }
    res.json({ message: 'Logged out successfully' });
});

// Admin Password Login Route
router.post('/login', checkIPBlockStatus, checkHoneypot, indiaAccessPolicy, behavioralCheck, async (req, res) => {
    const { username, password, deviceMetadata = {} } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    try {
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            await recordFailedAttempt(ip, username, userAgent, 'Invalid admin username');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            await recordFailedAttempt(ip, user.email || username, userAgent, 'Invalid admin password');
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Calculate risk parameters
        const geoData = await getGeoIPData(ip);
        const isDc = isDatacenterIP(geoData);
        
        const { isNewDevice, isTrusted, deviceId, browser, os } = await handleDeviceVerification(
            user.id, 
            'admin', 
            deviceMetadata, 
            req, 
            geoData
        );

        const failedAttempts = parseInt(await redis.get(`failed_attempts:${ip}`) || '0');
        const botCheck = detectBot(req);
        
        const risk = await calculateRiskScore({
            isVPN: geoData.vpn,
            isProxy: geoData.proxy,
            isDatacenter: isDc,
            isNewDevice: isNewDevice,
            isNewBrowser: browser !== userAgent.slice(0, 10), // simplified diff check
            isHeadless: botCheck.isBot && botCheck.reason.includes('Headless'),
            isBot: botCheck.isBot && !botCheck.reason.includes('Headless'),
            isNonIndia: geoData.country !== 'IN',
            failedAttemptsCount: failedAttempts
        });

        // Enforce risk policies
        if (risk.score >= 70) {
            await writeSecurityEvent({
                userId: user.id,
                userRole: 'admin',
                eventType: 'Blocked VPN',
                riskScore: risk.score,
                ip,
                country: geoData.country,
                city: geoData.city,
                device: `${browser} (${os})`,
                browser: userAgent,
                status: 'BLOCKED',
                metadata: { reasons: risk.reasons }
            });
            return res.status(403).json({ error: 'Security threshold exceeded. Login rejected.' });
        }

        // Enforce OTP escalation for risk levels 30–69 or untrusted device
        if (risk.score >= 30 || !isTrusted) {
            const otp = generateSecureOTP();
            const otpHash = await hashOTP(otp);
            const expires = new Date(Date.now() + 5 * 60000); // 5 min

            await db.query('UPDATE users SET otp_hash = $1, otp_expiry = $2 WHERE id = $3', [otpHash, expires, user.id]);

            if (user.email) {
                const resendInstance = getResend();
                const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
                
                if (resendInstance) {
                    await resendInstance.emails.send({
                        from: fromEmail,
                        to: [user.email],
                        subject: 'Admin Verification Required - MutantModz',
                        text: `Your OTP is: ${otp}`
                    });
                } else {
                    console.log(`[DEV MODE ADMIN OTP] ${otp}`);
                }
            }

            return res.json({ 
                requireOtp: true, 
                message: 'High-risk or unrecognized device. OTP sent to admin email.' 
            });
        }

        // Allow immediate login (Score < 30)
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        const refreshToken = crypto.randomBytes(40).toString('hex');

        await createSession(user.id, user.role, refreshToken, req, geoData);
        setSecureSessionCookie(res, accessToken);

        await writeSecurityEvent({
            userId: user.id,
            userRole: user.role,
            eventType: 'Login Success',
            riskScore: risk.score,
            ip,
            country: geoData.country,
            city: geoData.city,
            device: `${browser} (${os})`,
            browser: userAgent,
            status: 'SUCCESS',
            metadata: { method: 'password', deviceId }
        });

        res.json({
            token: accessToken,
            refreshToken,
            user: { id: user.id, username: user.username, role: user.role }
        });
    } catch (err) {
        console.error('LOGIN ERROR:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Access Token Refresh Route
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    const tokenHash = hashToken(refreshToken);
    const ip = req.ip || req.connection.remoteAddress;

    try {
        const sessionRes = await db.query(
            `SELECT * FROM sessions WHERE refresh_token_hash = $1`,
            [tokenHash]
        );

        if (sessionRes.rows.length === 0) {
            // Alarm: Potential Refresh Token Reuse!
            // Invalidate all active sessions for this user
            const authHeader = req.headers['authorization'];
            const accessToken = authHeader && authHeader.split(' ')[1];
            
            if (accessToken) {
                try {
                    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET, { ignoreExpiration: true });
                    if (decoded && decoded.id) {
                        await db.query('DELETE FROM sessions WHERE user_id = $1 AND user_role = $2', [decoded.id, decoded.role || 'customer']);
                        await writeSecurityEvent({
                            userId: decoded.id,
                            userRole: decoded.role || 'customer',
                            eventType: 'Refresh Token Reuse',
                            riskScore: 100,
                            ip,
                            country: 'IN',
                            city: 'Unknown',
                            device: 'Token Rotation Stage',
                            browser: req.headers['user-agent'] || '',
                            status: 'REVOKED',
                            metadata: { reason: 'Refresh token reuse detected. All sessions revoked.' }
                        });
                    }
                } catch (jwtErr) {
                    // Ignore decode issues
                }
            }

            return res.status(401).json({ error: 'Breach detected. All sessions revoked.' });
        }

        const session = sessionRes.rows[0];

        if (new Date() > session.expires_at) {
            await db.query('DELETE FROM sessions WHERE session_id = $1', [session.session_id]);
            return res.status(401).json({ error: 'Session expired.' });
        }

        // Generate rotated token pair
        const newAccessToken = jwt.sign(
            { id: session.user_id, username: '', role: session.user_role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        const newRefreshToken = crypto.randomBytes(40).toString('hex');
        const newHash = hashToken(newRefreshToken);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.query(
            `UPDATE sessions 
             SET refresh_token_hash = $1, expires_at = $2, last_seen = CURRENT_TIMESTAMP, ip = $3 
             WHERE session_id = $4`,
            [newHash, newExpiresAt, ip, session.session_id]
        );

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// View Active Sessions
router.get('/sessions', async (req, res, next) => {
    // Lazy resolve authenticateToken dependency to avoid circular requirements
    const { authenticateToken } = require('./auth');
    authenticateToken(req, res, next);
}, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT session_id, browser, ip, country, created_at, last_seen 
             FROM sessions 
             WHERE user_id = $1 AND user_role = $2 
             ORDER BY last_seen DESC`,
            [req.user.id, req.user.role]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Logout one specific session
router.delete('/sessions/:id', async (req, res, next) => {
    const { authenticateToken } = require('./auth');
    authenticateToken(req, res, next);
}, async (req, res) => {
    try {
        await db.query(
            `DELETE FROM sessions WHERE session_id = $1 AND user_id = $2 AND user_role = $3`,
            [req.params.id, req.user.id, req.user.role]
        );
        res.json({ message: 'Session logged out' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// Logout all sessions (Logout all devices)
router.delete('/sessions', async (req, res, next) => {
    const { authenticateToken } = require('./auth');
    authenticateToken(req, res, next);
}, async (req, res) => {
    try {
        await db.query(
            `DELETE FROM sessions WHERE user_id = $1 AND user_role = $2`,
            [req.user.id, req.user.role]
        );
        res.json({ message: 'All sessions logged out successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete all sessions' });
    }
});

// Admin change-password with HIBP verification
router.post('/change-password', async (req, res, next) => {
    const { authenticateToken } = require('./auth');
    authenticateToken(req, res, next);
}, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ error: 'Old and new passwords are required.' });
    }

    if (newPassword.length < 12) {
        return res.status(400).json({ error: 'Password must be at least 12 characters.' });
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
        return res.status(400).json({ error: 'Password must contain uppercase, lowercase, number, and special character.' });
    }

    try {
        const userRes = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Admin not found.' });

        const user = userRes.rows[0];
        const match = await bcrypt.compare(oldPassword, user.password_hash);
        if (!match) return res.status(400).json({ error: 'Current password is incorrect.' });

        // Have I Been Pwned check
        const pwned = await checkPwnedPassword(newPassword);
        if (pwned.isBreached) {
            return res.status(400).json({ error: `Security risk: This password has appeared in ${pwned.count} public data breaches. Choose another.` });
        }

        const hashed = await bcrypt.hash(newPassword, 12);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashed, user.id]);

        await writeSecurityEvent({
            userId: user.id,
            userRole: 'admin',
            eventType: 'Password Changed',
            riskScore: 0,
            ip: req.ip,
            status: 'SUCCESS',
            metadata: { username: user.username }
        });

        if (user.email) {
            await sendSecurityEmail(
                user.email,
                'Admin Password Changed',
                `<div style="font-family: sans-serif; padding: 20px; background-color: #09090b; color: white; border-radius: 12px;">
                    <h2>Password Successfully Changed</h2>
                    <p>The password for user: <strong>${user.username}</strong> has been updated.</p>
                </div>`
            );
        }

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin Security dashboard statistics API
router.get('/security-stats', async (req, res, next) => {
    const { authenticateToken } = require('./auth');
    authenticateToken(req, res, next);
}, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403);
    }

    try {
        const stats = {};
        
        // Blocked bots today
        const botsRes = await db.query(
            `SELECT COUNT(*) FROM security_events 
             WHERE (event_type = 'Blocked Bot' OR event_type = 'Honeynet Trap Triggered' OR event_type = 'Blocked VPN' OR event_type = 'Blocked Datacenter')
             AND timestamp > NOW() - INTERVAL '1 day'`
        );
        stats.blockedBotsToday = parseInt(botsRes.rows[0].count);

        // Blocked IPs
        const ipsRes = await db.query(`SELECT COUNT(*) FROM blocked_ips`);
        stats.blockedIps = parseInt(ipsRes.rows[0].count);

        // Blocked countries details
        const countriesRes = await db.query(
            `SELECT country, COUNT(*) as count FROM security_events 
             WHERE country != 'IN' AND timestamp > NOW() - INTERVAL '1 day'
             GROUP BY country ORDER BY count DESC`
        );
        stats.blockedCountries = countriesRes.rows;

        // VPN attempts
        const vpnRes = await db.query(
            `SELECT COUNT(*) FROM security_events 
             WHERE (event_type = 'Blocked VPN' OR event_type = 'Blocked Bot')
             AND timestamp > NOW() - INTERVAL '1 day'`
        );
        stats.vpnAttempts = parseInt(vpnRes.rows[0].count);

        // Datacenter requests
        const dcRes = await db.query(
            `SELECT COUNT(*) FROM security_events 
             WHERE (event_type = 'Blocked Datacenter')
             AND timestamp > NOW() - INTERVAL '1 day'`
        );
        stats.datacenterAttempts = parseInt(dcRes.rows[0].count);

        // OTP abuse events
        const otpRes = await db.query(
            `SELECT COUNT(*) FROM security_events 
             WHERE (event_type = 'OTP Failure' OR event_type = 'Rate Limit Triggered')
             AND timestamp > NOW() - INTERVAL '1 day'`
        );
        stats.otpAbuse = parseInt(otpRes.rows[0].count);

        // Failed logins count today
        const failedRes = await db.query(
            `SELECT COUNT(*) FROM security_events 
             WHERE event_type = 'Login Failure' AND timestamp > NOW() - INTERVAL '1 day'`
        );
        stats.failedLogins = parseInt(failedRes.rows[0].count);

        // Top attacked accounts
        const topAttacked = await db.query(
            `SELECT COALESCE(metadata->>'email', 'Unknown') as account, COUNT(*) as attempts 
             FROM security_events 
             WHERE event_type = 'Login Failure'
             GROUP BY account ORDER BY attempts DESC LIMIT 5`
        );
        stats.topAttackedAccounts = topAttacked.rows;

        // Top attacking IPs
        const topAttacking = await db.query(
            `SELECT ip, COUNT(*) as count, MAX(country) as country 
             FROM security_events 
             WHERE event_type IN ('Login Failure', 'Blocked Bot', 'Blocked VPN', 'Blocked Datacenter', 'Honeynet Trap Triggered')
             GROUP BY ip ORDER BY count DESC LIMIT 5`
        );
        stats.topAttackingIps = topAttacking.rows;

        // Risk statistics
        const riskStats = await db.query(
            `SELECT AVG(risk_score) as avg_score, MAX(risk_score) as max_score FROM security_events`
        );
        stats.riskStats = {
            averageScore: Math.round(parseFloat(riskStats.rows[0].avg_score || 0)),
            maxScore: parseInt(riskStats.rows[0].max_score || 0)
        };

        // Security events trend last 7 days
        const trends = await db.query(
            `SELECT TO_CHAR(timestamp, 'YYYY-MM-DD') as date, 
                    COUNT(*) FILTER (WHERE event_type = 'Login Success') as logins,
                    COUNT(*) FILTER (WHERE event_type = 'Login Failure') as failures,
                    COUNT(*) FILTER (WHERE event_type IN ('Blocked Bot', 'Blocked VPN', 'Blocked Datacenter', 'Honeynet Trap Triggered')) as attacks
             FROM security_events 
             WHERE timestamp > NOW() - INTERVAL '7 days'
             GROUP BY date ORDER BY date ASC`
        );
        stats.trends = trends.rows;

        // Recent security event list
        const recentEvents = await db.query(
            `SELECT event_id, event_type, risk_score, ip, country, city, status, timestamp 
             FROM security_events 
             ORDER BY timestamp DESC LIMIT 20`
        );
        stats.recentEvents = recentEvents.rows;

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch security stats' });
    }
});

// Auth Middleware (Legacy compatibility)
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

// Send OTP for Email Update
const handleSendEmailOTP = async (req, res) => {
    const { newEmail, userId, phone } = req.body;
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otp_hash = await bcrypt.hash(otp, 10);
        const otp_expiry = new Date(Date.now() + 10 * 60000);

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
                text: `Your MutantModz email verification code is: ${otp}`
            });
            res.json({ message: 'Verification code sent to your new email.' });
        } catch (mailError) {
            res.status(500).json({ error: 'Failed to send verification email' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

router.post('/send-email-update-otp', handleSendEmailOTP);
router.post('/send_email_update_otp', handleSendEmailOTP);

// Verify Email Update OTP
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
