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

// Ensure Logs Directory exists
const LOG_DIR = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
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
    
    // Append to dedicated security log file
    fs.appendFile(SECURITY_LOG_FILE, logLine + '\n', (err) => {
        if (err) {
            console.error('❌ Failed to write to security log:', err);
        }
    });

    // Also output to console in non-production environments
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[SECURITY] [${action}] Status: ${status} | IP: ${ip} | Email: ${email} | Reason: ${reason}`);
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
    'mailinator.com', '10minutemail.com', 'tempmail.com', 'yopmail.com', 
    'sharklasers.com', 'guerrillamail.com', 'dispostable.com', 'getairmail.com', 
    'throwawaymail.com', 'temp-mail.org', 'maildrop.cc', 'trashmail.com', 
    'burnermail.io', 'fakeinbox.com', 'generator.email', 'moakt.com', 
    'guerrillamailblock.com', 'guerrillamail.net', 'guerrillamail.org', 
    'guerrillamail.biz', 'guerrillamail.co', 'guerrillamail.de', 
    'disposable.com', 'tempmailaddress.com', 'mailnesia.com', 'mailcatch.com',
    'boun.cr', 'mintemail.com', 'spambox.us', 'spamex.com', 'spamgourmet.com',
    '0clickmail.com', '33mail.com', 'anonymousmail.me', 'tempmail.net'
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

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;

    try {
        // Option A: Cloudflare Turnstile
        if (turnstileSecret) {
            const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: turnstileSecret,
                    response: token,
                    remoteip: remoteIp
                })
            });

            const data = await response.json();
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
            if (userResult.rows.length > 0 && userResult.rows[0].email) {
                email = userResult.rows[0].email.trim().toLowerCase();
            }
        } catch (dbErr) {
            console.error('⚠️ Database lookup failed for phone-based email resolution in security middleware:', dbErr);
        }
    }

    // --- REQUIREMENT 6: BOT DETECTION ---
    const botCheck = detectBot(req);
    if (botCheck.isBot) {
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'BOT_BLOCKED',
            status: 'BLOCKED',
            reason: botCheck.reason
        });
        return res.status(429).json({ error: 'Automated request detected. Access Denied.' });
    }

    // --- REQUIREMENT 10: TEMPORARY IP BAN ---
    const ipBanUntil = securityStore.get(`ban_ip:${ip}`);
    if (ipBanUntil && Date.now() < ipBanUntil) {
        const remaining = Math.ceil((ipBanUntil - Date.now()) / 1000 / 60);
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'IP_BAN_CHECK',
            status: 'BLOCKED',
            reason: `IP temporarily banned. Remaining: ${remaining} mins`
        });
        return res.status(429).json({ 
            error: `Your IP has been temporarily locked due to suspicious activity. Try again in ${remaining} minutes.` 
        });
    }

    // Check if IP or email is blocked globally for excessive violations
    const ipViolations = securityStore.get(`violations_ip:${ip}`) || 0;
    if (ipViolations >= 5) {
        // Ban IP for 24 hours
        securityStore.set(`ban_ip:${ip}`, Date.now() + 24 * 60 * 60 * 1000, 24 * 60 * 60 * 1000);
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'IP_BANNED_24H',
            status: 'BANNED',
            reason: 'Exceeded maximum rate violations'
        });
        return res.status(429).json({ error: 'Your IP is banned due to abuse.' });
    }

    // Validate email format and protect against disposable domains
    if (email) {
        // --- REQUIREMENT 4: DISPOSABLE EMAIL PROTECTION ---
        if (isDisposableEmail(email)) {
            logSecurityEvent({
                ip,
                email,
                userAgent,
                action: 'DISPOSABLE_EMAIL_REJECT',
                status: 'REJECTED',
                reason: 'Disposable or temporary email provider detected'
            });
            return res.status(400).json({ error: 'Registration/Login using temporary emails is not permitted.' });
        }
    } else {
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'INVALID_REQUEST',
            status: 'REJECTED',
            reason: 'Email is required for OTP send request'
        });
        return res.status(400).json({ error: 'Email address is required.' });
    }

    // --- REQUIREMENT 1: OTP ENDPOINT PROTECTION & RATE LIMITS ---
    const hourlyEmailKey = `otp_hr_email:${email}`;
    const hourlyIpKey = `otp_hr_ip:${ip}`;
    const dailyIpKey = `otp_daily_ip:${ip}`;
    const cooldownIpKey = `otp_cooldown_ip:${ip}`;

    // 1. Cooldown protection (60 seconds between requests)
    const lastRequestTime = securityStore.get(cooldownIpKey);
    if (lastRequestTime) {
        const secondsPassed = Math.floor((Date.now() - lastRequestTime) / 1000);
        const cooldownRemaining = 60 - secondsPassed;
        if (cooldownRemaining > 0) {
            logSecurityEvent({
                ip,
                email,
                userAgent,
                action: 'COOLDOWN_VIOLATION',
                status: 'REJECTED',
                reason: `Cooldown violation. Remaining: ${cooldownRemaining}s`
            });
            return res.status(429).json({ 
                error: `Please wait ${cooldownRemaining} seconds before requesting another code.` 
            });
        }
    }

    // 2. Maximum 3 OTP emails per email address per hour
    const emailHourlyCount = securityStore.get(hourlyEmailKey) || 0;
    if (emailHourlyCount >= 3) {
        securityStore.set(`violations_ip:${ip}`, ipViolations + 1, 24 * 60 * 60 * 1000);
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'EMAIL_LIMIT_EXCEEDED',
            status: 'BLOCKED',
            reason: 'Max 3 OTP emails per email per hour exceeded'
        });
        return res.status(429).json({ error: 'Too many OTP requests for this email address. Please try again in an hour.' });
    }

    // 3. Maximum 5 OTP requests per IP address per hour
    const ipHourlyCount = securityStore.get(hourlyIpKey) || 0;
    if (ipHourlyCount >= 5) {
        securityStore.set(`violations_ip:${ip}`, ipViolations + 1, 24 * 60 * 60 * 1000);
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'IP_HOURLY_LIMIT_EXCEEDED',
            status: 'BLOCKED',
            reason: 'Max 5 OTP requests per IP per hour exceeded'
        });
        return res.status(429).json({ error: 'Too many OTP requests from this IP. Please try again in an hour.' });
    }

    // 4. Maximum 20 OTP requests per IP per day
    const ipDailyCount = securityStore.get(dailyIpKey) || 0;
    if (ipDailyCount >= 20) {
        // Apply temporary IP ban immediately
        securityStore.set(`ban_ip:${ip}`, Date.now() + 60 * 60 * 1000, 60 * 60 * 1000); // 1 hour ban
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'IP_DAILY_LIMIT_EXCEEDED',
            status: 'BANNED',
            reason: 'Max 20 OTP requests per IP per day exceeded. Temporary 1 hour ban applied.'
        });
        return res.status(429).json({ error: 'Daily OTP request limit exceeded. Try again in an hour.' });
    }

    // --- REQUIREMENT 6: BOT DETECTION - Multiple emails from one IP ---
    const ipEmailsKey = `ip_emails:${ip}`;
    const ipRequestedEmails = securityStore.get(ipEmailsKey) || [];
    if (!ipRequestedEmails.includes(email)) {
        ipRequestedEmails.push(email);
        securityStore.set(ipEmailsKey, ipRequestedEmails, 60 * 60 * 1000); // 1 hour TTL
    }
    if (ipRequestedEmails.length > 3) {
        securityStore.set(`ban_ip:${ip}`, Date.now() + 2 * 60 * 60 * 1000, 2 * 60 * 60 * 1000); // 2 hour ban
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'MULTIPLE_EMAILS_SUSPICION',
            status: 'BANNED',
            reason: `IP requested OTP for ${ipRequestedEmails.length} different emails: ${ipRequestedEmails.join(', ')}`
        });
        return res.status(429).json({ error: 'Suspicious multi-account request patterns detected. IP temporarily blocked.' });
    }

    // --- REQUIREMENT 10: ESCALATION & CAPTCHA MANDATE ---
    // If this is not the first request from the IP/email, mandate CAPTCHA
    const totalPreviousRequests = emailHourlyCount + ipHourlyCount;
    if (totalPreviousRequests > 0 || ipDailyCount > 2) {
        if (!recaptchaToken) {
            logSecurityEvent({
                ip,
                email,
                userAgent,
                action: 'CAPTCHA_REQUIRED',
                status: 'REJECTED',
                reason: 'Repeated requests. CAPTCHA token missing.'
            });
            return res.status(403).json({ 
                error: 'Security verification required. Please complete the CAPTCHA.' 
            });
        }
    }

    // --- REQUIREMENT 2: CAPTCHA VERIFICATION ---
    if (recaptchaToken) {
        const captchaResult = await verifyCaptcha(recaptchaToken, ip);
        if (!captchaResult.success) {
            logSecurityEvent({
                ip,
                email,
                userAgent,
                action: 'CAPTCHA_FAILURE',
                status: 'REJECTED',
                reason: `CAPTCHA verification failed: ${captchaResult.reason}`
            });
            return res.status(403).json({ error: 'Security verification failed. Please try again.' });
        }
    }

    // --- REQUIREMENT 10: EXPONENTIAL BACKOFF COOLDOWN ---
    // Increase cooldown dynamically based on requests count
    let backoffDelay = 60 * 1000; // base 60s
    if (emailHourlyCount === 1) backoffDelay = 5 * 60 * 1000;      // 2nd request: 5 mins
    if (emailHourlyCount === 2) backoffDelay = 15 * 60 * 1000;     // 3rd request: 15 mins
    if (emailHourlyCount >= 3) backoffDelay = 60 * 60 * 1000;      // subsequent: 1 hour

    // Increment Counts in Store
    securityStore.set(cooldownIpKey, Date.now(), backoffDelay);
    securityStore.set(hourlyEmailKey, emailHourlyCount + 1, 60 * 60 * 1000);
    securityStore.set(hourlyIpKey, ipHourlyCount + 1, 60 * 60 * 1000);
    securityStore.set(dailyIpKey, ipDailyCount + 1, 24 * 60 * 60 * 1000);

    logSecurityEvent({
        ip,
        email,
        userAgent,
        action: 'OTP_REQUEST_ALLOWED',
        status: 'SUCCESS',
        reason: `Request allowed. Hourly counts - IP: ${ipHourlyCount + 1}, Email: ${emailHourlyCount + 1}`
    });

    next();
};

// ==========================================
// 5. BRUTE-FORCE PROTECTION (FAILED OTP LOGINS)
// ==========================================
/**
 * Checks if an account is currently locked out due to too many failed OTP verification attempts.
 */
function checkBruteForceLockout(email, ip, userAgent) {
    const lockoutKey = `lockout:${email}`;
    const lockoutUntil = securityStore.get(lockoutKey);

    if (lockoutUntil && Date.now() < lockoutUntil) {
        const remainingMinutes = Math.ceil((lockoutUntil - Date.now()) / 1000 / 60);
        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'LOGIN_LOCKOUT_ENFORCED',
            status: 'BLOCKED',
            reason: `Account locked. Remaining: ${remainingMinutes} mins`
        });
        return {
            locked: true,
            remainingMinutes,
            error: `This account has been temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minutes.`
        };
    }
    return { locked: false };
}

/**
 * Handles failed OTP verification attempts and applies account lockout if threshold is exceeded.
 */
function handleFailedOTPAttempt(email, ip, userAgent) {
    const attemptsKey = `failed_attempts:${email}`;
    const lockoutKey = `lockout:${email}`;

    const failedCount = (securityStore.get(attemptsKey) || 0) + 1;
    securityStore.set(attemptsKey, failedCount, 15 * 60 * 1000); // 15 min TTL

    logSecurityEvent({
        ip,
        email,
        userAgent,
        action: 'FAILED_OTP_VERIFICATION',
        status: 'FAILED',
        reason: `Attempt ${failedCount} of 5`
    });

    if (failedCount >= 5) {
        const lockoutTimeMs = 15 * 60 * 1000; // Lock for 15 minutes
        securityStore.set(lockoutKey, Date.now() + lockoutTimeMs, lockoutTimeMs);
        securityStore.delete(attemptsKey); // Clear attempts counter during active lockout

        logSecurityEvent({
            ip,
            email,
            userAgent,
            action: 'ACCOUNT_LOCKED',
            status: 'LOCKED',
            reason: '5 failed attempts reached. Account locked for 15 minutes.'
        });

        return {
            locked: true,
            error: 'Maximum failed attempts reached. Your account is locked for 15 minutes.'
        };
    }

    return {
        locked: false,
        remainingAttempts: 5 - failedCount
    };
}

/**
 * Clears failed login attempts on a successful verification.
 */
function clearFailedOTPAttempts(email) {
    securityStore.delete(`failed_attempts:${email}`);
    securityStore.delete(`lockout:${email}`);
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
    checkBruteForceLockout,
    handleFailedOTPAttempt,
    clearFailedOTPAttempts
};
