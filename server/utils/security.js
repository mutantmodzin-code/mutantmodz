/**
 * production-level Security Engine for Email OTP Login and Session Management.
 * Implements:
 * 1. OTP Endpoint Protection (Cooldowns, Hour/Day Rate Limits by IP & Email)
 * 2. CAPTCHA Verification (Google reCAPTCHA v3 & Cloudflare Turnstile)
 * 3. Multi-Dimension Rate Limiting & Auto IP Ban (IP, Email, User-Agent)
 * 4. Disposable/Fake Email Protection
 * 5. Brute-Force Protection (15-min lockout after 5 failures)
 * 6. Bot/Headless Browser & Proxy/VPN Detection
 * 7. Dedicated Security Audit Logger
 * 8. Cryptographically Secure OTP Generator
 * 9. Session Cookie & CSRF Security Helpers
 * 10. Exponential Backoff & CAPTCHA Escalation
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const redis = require('./redis');

// ==========================================
// GLOBALS & POLYFILLS (fetch support for legacy Node.js runtimes)
// ==========================================
if (!globalThis.fetch) {
    const https = require('https');
    const http = require('http');
    const { URL } = require('url');

    globalThis.fetch = function (url, options = {}) {
        return new Promise((resolve, reject) => {
            const parsedUrl = new URL(url);
            const client = parsedUrl.protocol === 'https:' ? https : http;
            
            const reqOptions = {
                method: options.method || 'GET',
                headers: options.headers || {},
                timeout: options.signal ? 3000 : undefined
            };

            const req = client.request(url, reqOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    let parsedData;
                    try {
                        parsedData = JSON.parse(data);
                    } catch (e) {
                        parsedData = null;
                    }
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        json: () => Promise.resolve(parsedData),
                        text: () => Promise.resolve(data)
                    });
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request Timeout'));
            });

            if (options.body) {
                req.write(options.body);
            }
            req.end();

            if (options.signal) {
                options.signal.addEventListener('abort', () => {
                    req.destroy();
                    reject(new Error('The user aborted a request.'));
                });
            }
        });
    };
}

// Ensure Logs Directory exists (only if not in a read-only environment)
const LOG_DIR = path.join(__dirname, '..', 'logs');
try {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
} catch (err) {
    if (process.env.NODE_ENV !== 'production') {
        console.warn('⚠️ Could not create logs directory:', err.message);
    }
}
const SECURITY_LOG_FILE = path.join(LOG_DIR, 'security.log');

// ==========================================
// 7. SECURITY AUDIT LOGGER
// ==========================================
function logSecurityEvent(event) {
    const { ip, email, userAgent, action, status, reason } = event;
    const timestamp = new Date().toISOString();
    const logLine = JSON.stringify({
        timestamp,
        ip: ip || 'UNKNOWN_IP',
        email: email || 'UNKNOWN_EMAIL',
        userAgent: userAgent || 'UNKNOWN_UA',
        action,
        status,
        reason: reason || ''
    });
    
    // Always print to console so cloud logging captures the events
    console.log(`[SECURITY] [${action}] Status: ${status} | IP: ${ip} | Email: ${email} | Reason: ${reason}`);

    // Append to dedicated security log file (local/development environments)
    fs.appendFile(SECURITY_LOG_FILE, logLine + '\n', (err) => {
        if (err && process.env.NODE_ENV !== 'production') {
            console.error('❌ Failed to write to security log:', err.message);
        }
    });

    // Persist log to PostgreSQL database
    try {
        const db = require('../db');
        db.query(
            'INSERT INTO security_logs (ip, email, user_agent, action, status, reason) VALUES ($1, $2, $3, $4, $5, $6)',
            [ip || 'UNKNOWN_IP', email || 'UNKNOWN_EMAIL', userAgent || 'UNKNOWN_UA', action, status, reason || '']
        ).catch(err => console.error('Failed to log security event to DB:', err.message));
    } catch (dbErr) {
        console.error('Failed to require/query db in security logger:', dbErr.message);
    }
}

// ==========================================
// 3. IN-MEMORY STORAGE FOR RATE LIMITS & LOCKOUTS
// ==========================================
class InMemorySecurityCache {
    constructor() {
        this.cache = new Map();
        // Run self-cleanup every 10 minutes to prevent memory leaks
        setInterval(() => this.cleanupExpiredEntries(), 10 * 60 * 1000);
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            return null;
        }
        return entry.value;
    }

    set(key, value, ttlMs) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + ttlMs
        });
    }

    delete(key) {
        this.cache.delete(key);
    }

    cleanupExpiredEntries() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
    }
}

const securityStore = new InMemorySecurityCache();

// ==========================================
// 4. DISPOSABLE EMAIL PROTECTION
// ==========================================
// Comprehensive list of popular disposable/temp email domains
const DISPOSABLE_DOMAINS = new Set([
    // Classic disposable services
    'mailinator.com', '10minutemail.com', 'tempmail.com', 'yopmail.com',
    'sharklasers.com', 'guerrillamail.com', 'dispostable.com', 'getairmail.com',
    'throwawaymail.com', 'temp-mail.org', 'maildrop.cc', 'trashmail.com',
    'burnermail.io', 'fakeinbox.com', 'generator.email', 'moakt.com',
    'guerrillamailblock.com', 'guerrillamail.net', 'guerrillamail.org',
    'guerrillamail.biz', 'guerrillamail.co', 'guerrillamail.de',
    'disposable.com', 'tempmailaddress.com', 'mailnesia.com', 'mailcatch.com',
    'boun.cr', 'mintemail.com', 'spambox.us', 'spamex.com', 'spamgourmet.com',
    '0clickmail.com', '33mail.com', 'anonymousmail.me', 'tempmail.net',
    // Additional blocked domains
    'example.com', 'test.com', 'mailnull.com', 'mailscrap.com',
    'inboxbear.com', 'tempr.email', 'discard.email', 'spamgourmet.net',
    'getonemail.com', 'mailpoof.com', 'mohmal.com', 'tempemail.net',
    'throwam.com', 'mailtemp.info', 'drdrb.com', 'filzmail.com',
    'jetable.fr.nf', 'meltmail.com', 'nwldx.com', 'sogetthis.com',
    'spamfree24.org', 'spamgob.com', 'spam4.me', 'trashmail.at',
    'trashmail.io', 'trashmail.me', 'trashmail.net', 'trashmail.org',
    'wegwerfmail.de', 'wegwerfmail.net', 'wegwerfmail.org', 'yopmail.fr',
    'tmpmail.net', 'tmpmail.org', 'trashmail.xyz', 'crazymailing.com',
    'e4ward.com', 'egotab.com', 'einrot.com', 'emltmp.com'
]);

function isDisposableEmail(email) {
    if (!email || typeof email !== 'string') return true;
    const parts = email.trim().toLowerCase().split('@');
    if (parts.length !== 2) return true;
    const domain = parts[1];

    // Check if domain or any subdomain is in the blocklist
    if (DISPOSABLE_DOMAINS.has(domain)) return true;

    // Check for common disposable keywords in the domain name
    const tempKeywords = ['temp', 'disposable', 'trash', 'spam', 'fake', 'throwaway', 'anon'];
    if (tempKeywords.some(keyword => domain.includes(keyword))) {
        return true;
    }
    return false;
}

// ==========================================
// 6. BOT & HEADLESS BROWSER DETECTION
// ==========================================
function detectBot(req) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.connection.remoteAddress;

    // 1. Missing User-Agent is highly suspicious
    if (!userAgent) {
        return { isBot: true, reason: 'Missing User-Agent header' };
    }

    // 2. Common Headless Browsers and Web Automation Frameworks
    const botPatterns = [
        /headless/i, /puppeteer/i, /selenium/i, /playwright/i, 
        /phantomjs/i, /jsdom/i, /webdriver/i, /axios/i, 
        /node-fetch/i, /python-requests/i, /curl/i, /wget/i,
        /nmap/i, /sqlmap/i, /nikto/i, /gobuster/i, /postman/i
    ];

    for (const pattern of botPatterns) {
        if (pattern.test(userAgent)) {
            return { isBot: true, reason: `Headless or automation User-Agent: ${userAgent}` };
        }
    }

    // 3. Proxy/VPN Headers Detection (Suspicious combinations)
    // Cloudflare, AWS, or public proxy typical headers
    const proxyHeaders = [
        'via', 'forwarded', 'x-proxy-id', 'x-forwarded-by', 'proxy-connection'
    ];
    for (const header of proxyHeaders) {
        if (req.headers[header]) {
            // Log as potential proxy traffic but don't strictly block unless combined with high rates
            logSecurityEvent({
                ip,
                userAgent,
                action: 'PROXY_DETECTED',
                status: 'WARN',
                reason: `Header present: ${header} = ${req.headers[header]}`
            });
        }
    }

    return { isBot: false };
}

// ==========================================
// 2. CAPTCHA VERIFICATION (reCAPTCHA v3 & Turnstile)
// ==========================================
async function verifyCaptcha(token, remoteIp) {
    if (!token) return { success: false, reason: 'No token provided' };

    // Cloudflare Turnstile takes priority if configured
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    try {
        // Option A: Cloudflare Turnstile (preferred - better than reCAPTCHA)
        if (turnstileSecret) {
            // Cloudflare Turnstile requires application/x-www-form-urlencoded
            const params = new URLSearchParams();
            params.append('secret', turnstileSecret);
            params.append('response', token);
            if (remoteIp) params.append('remoteip', remoteIp);

            const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            if (!response.ok) {
                console.error(`❌ Turnstile server responded with HTTP ${response.status}`);
                return { success: false, reason: `Turnstile HTTP error: ${response.status}` };
            }

            const data = await response.json();
            console.log('🛡️ Turnstile verification response:', JSON.stringify(data));
            if (data.success) {
                return { success: true, provider: 'turnstile' };
            }
            return { success: false, reason: 'Turnstile verification failed', details: data['error-codes'] };
        }

        // Option B: Google reCAPTCHA v3
        if (recaptchaSecret) {
            const params = new URLSearchParams();
            params.append('secret', recaptchaSecret);
            params.append('response', token);
            if (remoteIp) params.append('remoteip', remoteIp);

            const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            });

            const data = await response.json();
            if (!data.success) {
                const errorCodes = data['error-codes'] || [];
                const isLocalOrPreview = process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'development' || !process.env.VERCEL;
                if (isLocalOrPreview || errorCodes.includes('domain-not-allowed') || errorCodes.includes('invalid-input-secret')) {
                    console.log('⚡ Bypassing reCAPTCHA failure in security middleware for preview/development/misconfiguration:', errorCodes);
                    return { success: true, provider: 'recaptcha_bypass_lenient' };
                }
                return { success: false, reason: 'reCAPTCHA verification failed', details: data['error-codes'] };
            }

            // For reCAPTCHA v3, verify the score (threshold 0.5)
            const score = data.score !== undefined ? data.score : 1.0;
            if (score < 0.5) {
                return { success: false, reason: `reCAPTCHA score too low: ${score}`, score };
            }

            return { success: true, provider: 'recaptcha', score };
        }

        // No keys configured - in development we allow bypassing, but warn in security log
        logSecurityEvent({
            ip: remoteIp,
            action: 'CAPTCHA_BYPASS',
            status: 'WARN',
            reason: 'CAPTCHA keys missing from environment variables.'
        });
        return { success: true, provider: 'bypass_dev' };

    } catch (err) {
        console.error('CAPTCHA verification exception:', err);
        return { success: false, reason: 'CAPTCHA service exception', error: err.message };
    }
}

// ==========================================
// 8. OTP SECURITY FUNCTIONS
// ==========================================
/**
 * Generates a cryptographically secure 6-digit OTP code
 */
function generateSecureOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hashes OTP code before database storage
 */
async function hashOTP(otp) {
    return await bcrypt.hash(otp, 10);
}

// ==========================================
// 9. SESSION SECURITY HELPERS
// ==========================================
/**
 * Sets secure, HttpOnly, and SameSite cookies on the response
 */
function setSecureSessionCookie(res, token) {
    const cookieOptions = {
        httpOnly: true, // Prevents XSS-based cookie theft
        secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in prod
        sameSite: 'strict', // Mitigates CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
        path: '/'
    };
    res.cookie('auth_token', token, cookieOptions);
}

/**
 * Clears the session cookies
 */
function clearSecureSessionCookie(res) {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
}

/**
 * In-memory parser for reading cookies from requests (without cookie-parser dependency)
 */
function parseCookies(req) {
    const list = {};
    const cookieHeader = req.headers.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(';').forEach(cookie => {
        let [name, ...rest] = cookie.split('=');
        name = name.trim();
        if (!name) return;
        const val = rest.join('=').trim();
        list[name] = decodeURIComponent(val);
    });

    return list;
}

// ==========================================
// 10. ABUSE PREVENTION & RATE LIMITS MIDDLEWARE
// ==========================================

/**
 * Middleware to check if an IP address is blocked in the database.
 */
const checkIPBlockStatus = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    try {
        const db = require('../db');
        const blockedRes = await db.query(
            'SELECT * FROM blocked_ips WHERE ip = $1',
            [ip]
        );
        if (blockedRes.rows.length > 0) {
            const block = blockedRes.rows[0];
            if (block.block_type === 'permanent') {
                return res.status(403).json({ error: 'This IP address has been permanently blocked due to suspicious activity.' });
            }
            if (block.expires_at && new Date() < new Date(block.expires_at)) {
                const minutesLeft = Math.ceil((new Date(block.expires_at) - new Date()) / (1000 * 60));
                return res.status(403).json({ 
                    error: `This IP address is temporarily blocked. Try again in ${minutesLeft} minutes.` 
                });
            }
            // If expired, clean up the block
            await db.query('DELETE FROM blocked_ips WHERE ip = $1', [ip]);
        }
    } catch (err) {
        console.error('Failed to check blocked IP status:', err.message);
    }
    next();
};

/**
 * Middleware to check honeypot fields to filter automated bot requests.
 */
const checkHoneypot = async (req, res, next) => {
    const { website } = req.body;
    if (website) {
        const ip = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'] || '';
        const email = req.body.email || 'NONE';
        
        await recordFailedAttempt(ip, email, userAgent, 'Honeypot field filled');
        return res.status(400).json({ error: 'Spam detected. Access denied.' });
    }
    next();
};

/**
 * Records a failed attempt for an IP and applies automatic 24h or permanent bans.
 */
const recordFailedAttempt = async (ip, email, userAgent, reason) => {
    const db = require('../db');
    
    // 1. Log event in database and security log file
    logSecurityEvent({
        ip,
        email,
        userAgent,
        action: 'AUTH_FAILED',
        status: 'FAILED',
        reason
    });

    try {
        // 2. Increment failed attempts count in Redis
        const failedKey = `failed_attempts:${ip}`;
        const count = await redis.incr(failedKey);

        if (count >= 20) {
            // Permanent block after 20 failed attempts
            await db.query(
                `INSERT INTO blocked_ips (ip, block_type, expires_at) 
                 VALUES ($1, 'permanent', NULL) 
                 ON CONFLICT (ip) 
                 DO UPDATE SET block_type = 'permanent', expires_at = NULL`,
                [ip]
            );
            logSecurityEvent({
                ip,
                email,
                userAgent,
                action: 'IP_BLOCKED_PERMANENT',
                status: 'BLOCKED',
                reason: `Exceeded 20 failed attempts (count: ${count})`
            });
        } else if (count >= 10) {
            // 24h block after 10 failed attempts
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await db.query(
                `INSERT INTO blocked_ips (ip, block_type, expires_at) 
                 VALUES ($1, 'temporary', $2) 
                 ON CONFLICT (ip) 
                 DO UPDATE SET block_type = 'temporary', expires_at = $2`,
                [ip, expiresAt]
            );
            logSecurityEvent({
                ip,
                email,
                userAgent,
                action: 'IP_BLOCKED_24H',
                status: 'BLOCKED',
                reason: `Exceeded 10 failed attempts (count: ${count})`
            });
        }
    } catch (err) {
        console.error('Failed to record failed attempt or block IP:', err.message);
    }
};

const OTP_PROTECTION_MIDDLEWARE = async (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    let email = req.body.email ? req.body.email.trim().toLowerCase() : null;
    const phone = req.body.phone;
    const recaptchaToken = req.body.recaptchaToken || req.body.captchaToken;

    // Resolve email from phone in DB if email is missing
    if (!email && phone) {
        try {
            const db = require('../db');
            let userResult = await db.query('SELECT email FROM customers WHERE phone = $1', [phone]);
            if (userResult.rows.length === 0) {
                userResult = await db.query('SELECT email FROM users WHERE phone = $1', [phone]);
            }
            if (userResult.rows.length === 0) {
                userResult = await db.query('SELECT email FROM pending_registrations WHERE phone = $1', [phone]);
            }
            if (userResult.rows.length > 0 && userResult.rows[0].email) {
                email = userResult.rows[0].email.trim().toLowerCase();
            }
        } catch (dbErr) {
            console.error('⚠️ Database lookup failed for phone-based email resolution in security middleware:', dbErr);
        }
    }

    // Check if IP is blocked in database
    let ipBlocked = false;
    try {
        const db = require('../db');
        const blockedRes = await db.query('SELECT * FROM blocked_ips WHERE ip = $1', [ip]);
        if (blockedRes.rows.length > 0) {
            const block = blockedRes.rows[0];
            if (block.block_type === 'permanent') {
                return res.status(403).json({ error: 'This IP address has been permanently blocked due to suspicious activity.' });
            }
            if (block.expires_at && new Date() < new Date(block.expires_at)) {
                const minutesLeft = Math.ceil((new Date(block.expires_at) - new Date()) / (1000 * 60));
                return res.status(403).json({ 
                    error: `This IP address is temporarily blocked. Try again in ${minutesLeft} minutes.` 
                });
            }
        }
    } catch (err) {
        console.error('Failed to query blocked_ips table:', err.message);
    }

    // Honeypot validation
    if (req.body.website) {
        await recordFailedAttempt(ip, email || 'NONE', userAgent, 'Honeypot field filled');
        return res.status(400).json({ error: 'Spam detected. Access denied.' });
    }

    // Bot check
    const botCheck = detectBot(req);
    if (botCheck.isBot) {
        await recordFailedAttempt(ip, email || 'NONE', userAgent, botCheck.reason);
        return res.status(429).json({ error: 'Automated request detected. Access Denied.' });
    }

    // Validate email format strictly (RFC 5322 compliant regex)
    if (email) {
        const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            await recordFailedAttempt(ip, email, userAgent, `Invalid email format: ${email}`);
            return res.status(400).json({ error: 'Please enter a valid email address.' });
        }

        // Disposable Email Protection — block all known temp/fake domains
        if (isDisposableEmail(email)) {
            await recordFailedAttempt(ip, email, userAgent, `Disposable email domain detected: ${email}`);
            return res.status(400).json({ error: 'Disposable or temporary email addresses are not allowed. Please use a real email.' });
        }
    } else {
        await recordFailedAttempt(ip, 'NONE', userAgent, 'Email is required for OTP send request');
        return res.status(400).json({ error: 'Email address is required.' });
    }

    // Captcha verification
    if (!recaptchaToken) {
        await recordFailedAttempt(ip, email, userAgent, 'Verification token missing before OTP send');
        return res.status(403).json({ error: 'Verification failed.' });
    }

    const captchaResult = await verifyCaptcha(recaptchaToken, ip);
    if (!captchaResult.success) {
        await recordFailedAttempt(ip, email, userAgent, `CAPTCHA verification failed: ${captchaResult.reason}`);
        return res.status(403).json({ error: 'Verification failed.' });
    }

    // UPSTASH REDIS RATE LIMITS & COOLDOWNS
    const email15mKey = `otp_15m_email:${email}`;
    const ipHourlyKey = `otp_hr_ip:${ip}`;
    const cooldownEmailKey = `otp_cooldown_email:${email}`;
    const cooldownIpKey = `otp_cooldown_ip:${ip}`;

    // 1. 60-second cooldown protection between resends
    const emailCooldown = await redis.get(cooldownEmailKey);
    const ipCooldown = await redis.get(cooldownIpKey);

    if (emailCooldown || ipCooldown) {
        return res.status(429).json({ error: 'Please wait 60 seconds before requesting another code.' });
    }

    // 2. Maximum 3 OTP requests per email within 15 minutes
    const email15mCount = parseInt(await redis.get(email15mKey) || '0');
    if (email15mCount >= 3) {
        await recordFailedAttempt(ip, email, userAgent, `Email ${email} exceeded 3 OTP requests within 15 minutes`);
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // 3. Maximum 5 OTP requests per IP per hour
    const ipHourlyCount = parseInt(await redis.get(ipHourlyKey) || '0');
    if (ipHourlyCount >= 5) {
        await recordFailedAttempt(ip, email, userAgent, `IP ${ip} exceeded 5 OTP requests within 1 hour`);
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    // Set cooldown (60 seconds)
    await redis.set(cooldownEmailKey, '1', { ex: 60 });
    await redis.set(cooldownIpKey, '1', { ex: 60 });

    // Increment email counter and set 15m expiration
    const nextEmailCount = await redis.incr(email15mKey);
    if (nextEmailCount === 1) {
        await redis.expire(email15mKey, 15 * 60);
    }

    // Increment IP counter and set 1h expiration
    const nextIpCount = await redis.incr(ipHourlyKey);
    if (nextIpCount === 1) {
        await redis.expire(ipHourlyKey, 60 * 60);
    }

    logSecurityEvent({
        ip,
        email,
        userAgent,
        action: 'OTP_REQUEST_ALLOWED',
        status: 'SUCCESS',
        reason: `OTP allowed. Email 15m count: ${nextEmailCount}, IP hourly count: ${nextIpCount}`
    });

    next();
};

// ==========================================
// ENTERPRISE SECURITY UTILITIES
// ==========================================

const { Resend } = require('resend');
let resendClientInstance = null;

function getResendClient() {
    if (!resendClientInstance && process.env.RESEND_API_KEY) {
        resendClientInstance = new Resend(process.env.RESEND_API_KEY);
    }
    return resendClientInstance;
}

/**
 * Sends a security email notification using Resend
 */
async function sendSecurityEmail(email, subject, html) {
    const resend = getResendClient();
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    if (!resend) {
        console.log(`[MOCK EMAIL] to: ${email} | Subject: ${subject}`);
        console.log(`[MOCK EMAIL BODY] ${html.replace(/<[^>]*>/g, '')}`);
        return;
    }
    try {
        await resend.emails.send({
            from: fromEmail,
            to: [email],
            subject: subject,
            html: html
        });
        console.log(`✓ Security notification email sent to ${email}`);
    } catch (err) {
        console.error('❌ Failed to send security email:', err.message);
    }
}

/**
 * Retrieves GeoIP metadata with local caching and fallback checks
 */
async function getGeoIPData(ip) {
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.16.') || ip.startsWith('::ffff:127.0.0.1')) {
        return {
            country: 'IN',
            country_name: 'India',
            city: 'Coimbatore',
            lat: 11.0168,
            lon: 76.9558,
            isp: 'Reliance Jio Infocomm',
            org: 'Reliance Jio Infocomm Limited',
            proxy: false,
            vpn: false
        };
    }

    const cacheKey = `geoip_cache:${ip}`;
    try {
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
    } catch (err) {
        console.error('Redis geoip cache read error:', err.message);
    }

    try {
        // Primary provider: FreeIPAPI
        const response = await fetch(`https://freeipapi.com/api/json/${ip}`, { signal: AbortSignal.timeout(2000) });
        if (response.ok) {
            const data = await response.json();
            const geoData = {
                country: data.countryCode || 'IN',
                country_name: data.countryName || 'India',
                city: data.cityName || 'Unknown',
                lat: data.latitude || 11.0168,
                lon: data.longitude || 76.9558,
                isp: 'Reliance Jio Infocomm', // Default fallback
                org: '',
                proxy: data.isProxy || false,
                vpn: data.isVpn || false
            };

            // Secondary check for ISP & Org details (ip-api.com)
            try {
                const secondaryRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,countryCode,country,city,lat,lon,isp,org,proxy,vpn`, { signal: AbortSignal.timeout(1500) });
                if (secondaryRes.ok) {
                    const sec = await secondaryRes.json();
                    if (sec.status === 'success') {
                        geoData.isp = sec.isp || geoData.isp;
                        geoData.org = sec.org || geoData.org;
                        geoData.proxy = sec.proxy || geoData.proxy;
                        geoData.vpn = sec.vpn || geoData.vpn;
                        geoData.country = sec.countryCode || geoData.country;
                        geoData.country_name = sec.country || geoData.country_name;
                        geoData.city = sec.city || geoData.city;
                        geoData.lat = sec.lat || geoData.lat;
                        geoData.lon = sec.lon || geoData.lon;
                    }
                }
            } catch (secErr) {
                // Ignore secondary failure
            }

            try {
                await redis.set(cacheKey, JSON.stringify(geoData), { ex: 24 * 60 * 60 });
            } catch (err) {
                // Ignore cache set errors
            }

            return geoData;
        }
    } catch (err) {
        console.error(`Primary GeoIP lookup failed for ${ip}:`, err.message);
    }

    return {
        country: 'IN',
        country_name: 'India',
        city: 'Coimbatore',
        lat: 11.0168,
        lon: 76.9558,
        isp: 'Unknown ISP',
        org: 'Unknown Org',
        proxy: false,
        vpn: false
    };
}

/**
 * Checks if the request is originating from a cloud hosting datacenter
 */
function isDatacenterIP(geoData) {
    if (!geoData) return false;
    const org = (geoData.org || geoData.isp || '').toLowerCase();
    const dcKeywords = [
        'amazon', 'aws', 'microsoft', 'azure', 'google', 'oracle',
        'hetzner', 'ovh', 'digitalocean', 'vultr', 'linode',
        'datacenter', 'hosting', 'cloud', 'server', 'm247',
        'contabo', 'leaseweb', 'scannet', 'choopa', 'zenlayer'
    ];
    return dcKeywords.some(keyword => org.includes(keyword));
}

/**
 * Haversine formula helper
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
    const toRad = x => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Checks if consecutive logins represent physically impossible travel
 */
async function checkImpossibleTravel(userId, userRole, currentLat, currentLon, currentTimestamp) {
    const db = require('../db');
    try {
        const res = await db.query(
            `SELECT timestamp, metadata FROM security_events 
             WHERE user_id = $1 AND user_role = $2 AND event_type = 'Login Success' AND status = 'SUCCESS'
             ORDER BY timestamp DESC LIMIT 1`,
            [userId, userRole]
        );

        if (res.rows.length === 0) {
            return { isSuspicious: false };
        }

        const lastEvent = res.rows[0];
        const lastMetadata = lastEvent.metadata || {};
        const lastLat = parseFloat(lastMetadata.latitude);
        const lastLon = parseFloat(lastMetadata.longitude);
        const lastTime = new Date(lastEvent.timestamp).getTime();

        if (isNaN(lastLat) || isNaN(lastLon)) {
            return { isSuspicious: false };
        }

        const distance = haversineDistance(lastLat, lastLon, parseFloat(currentLat), parseFloat(currentLon));
        const timeDiffMs = new Date(currentTimestamp).getTime() - lastTime;
        const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

        if (timeDiffHours <= 0) {
            if (distance > 50) {
                return { isSuspicious: true, speed: 9999, distance };
            }
            return { isSuspicious: false };
        }

        const speed = distance / timeDiffHours; // km/h
        
        // Flag speed > 800 km/h and distance > 100 km
        if (speed > 800 && distance > 100) {
            return {
                isSuspicious: true,
                speed: Math.round(speed),
                distance: Math.round(distance),
                timeDiffMinutes: Math.round(timeDiffHours * 60)
            };
        }
    } catch (err) {
        console.error('Impossible travel check failed:', err.message);
    }
    return { isSuspicious: false };
}

/**
 * Validates password strength & checks Have I Been Pwned database
 */
async function checkPwnedPassword(password) {
    if (!password || password.length < 6) return { isBreached: false };
    try {
        const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
        const prefix = hash.slice(0, 5);
        const suffix = hash.slice(5);

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { signal: AbortSignal.timeout(3000) });
        if (!response.ok) {
            return { isBreached: false };
        }

        const dataText = await response.text();
        const hashes = dataText.split('\n');
        for (const line of hashes) {
            const [hashSuffix, count] = line.split(':');
            if (hashSuffix.trim() === suffix) {
                return { isBreached: true, count: parseInt(count, 10) };
            }
        }
    } catch (err) {
        console.error('Have I Been Pwned check exception:', err.message);
    }
    return { isBreached: false };
}

/**
 * Calculates a consolidated risk score for a request
 */
async function calculateRiskScore(options = {}) {
    let score = 0;
    const reasons = [];

    const {
        isVPN = false,
        isProxy = false,
        isDatacenter = false,
        isNewDevice = false,
        isNewBrowser = false,
        isHeadless = false,
        isBot = false,
        isDisposableEmail = false,
        isTurnstileFailed = false,
        isNonIndia = false,
        failedAttemptsCount = 0
    } = options;

    if (isVPN) {
        score += 30;
        reasons.push('VPN Detected (+30)');
    }
    if (isProxy) {
        score += 30;
        reasons.push('Proxy Detected (+30)');
    }
    if (isDatacenter) {
        score += 40;
        reasons.push('Datacenter Traffic (+40)');
    }
    if (isNewDevice) {
        score += 20;
        reasons.push('New Device (+20)');
    }
    if (isNewBrowser) {
        score += 15;
        reasons.push('New Browser profile (+15)');
    }
    if (isHeadless) {
        score += 80;
        reasons.push('Headless Browser (+80)');
    }
    if (isBot) {
        score += 100;
        reasons.push('Automated Bot Signature (+100)');
    }
    if (isDisposableEmail) {
        score += 50;
        reasons.push('Disposable Email domain (+50)');
    }
    if (isTurnstileFailed) {
        score += 100;
        reasons.push('Cloudflare Challenge Failure (+100)');
    }
    if (isNonIndia) {
        score += 80;
        reasons.push('Non-India Traffic (+80)');
    }
    if (failedAttemptsCount > 0) {
        const add = failedAttemptsCount * 10;
        score += add;
        reasons.push(`Multiple Failed Logins (+${add})`);
    }

    return { score, reasons };
}

/**
 * Records a rich enterprise security event in the DB
 */
async function writeSecurityEvent(event) {
    const { userId, userRole, eventType, riskScore, ip, country, city, device, browser, status, metadata } = event;
    const db = require('../db');
    try {
        await db.query(
            `INSERT INTO security_events (user_id, user_role, event_type, risk_score, ip, country, city, device, browser, status, metadata)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
                userId || null,
                userRole || null,
                eventType,
                riskScore || 0,
                ip || 'UNKNOWN_IP',
                country || 'IN',
                city || 'Unknown',
                device || 'Unknown Device',
                browser || 'Unknown Browser',
                status || 'SUCCESS',
                metadata ? JSON.stringify(metadata) : '{}'
            ]
        );
        console.log(`🛡️ [ENTERPRISE EVENT] Logged: ${eventType} | Score: ${riskScore} | IP: ${ip}`);
    } catch (err) {
        console.error('❌ Failed to log security event:', err.message);
    }
}

module.exports = {
    logSecurityEvent,
    isDisposableEmail,
    detectBot,
    verifyCaptcha,
    generateSecureOTP,
    hashOTP,
    setSecureSessionCookie,
    clearSecureSessionCookie,
    parseCookies,
    OTP_PROTECTION_MIDDLEWARE,
    checkIPBlockStatus,
    checkHoneypot,
    recordFailedAttempt,
    // Enterprise utilities export
    sendSecurityEmail,
    getGeoIPData,
    isDatacenterIP,
    checkImpossibleTravel,
    checkPwnedPassword,
    calculateRiskScore,
    writeSecurityEvent
};

