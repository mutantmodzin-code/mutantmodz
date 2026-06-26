const { 
    writeSecurityEvent, 
    getGeoIPData, 
    verifyCaptcha,
    calculateRiskScore
} = require('../utils/security');

/**
 * Enforces India-only access policy.
 * Admin portal logins outside India are blocked.
 * Regular customers outside India must pass a Turnstile challenge.
 */
async function indiaAccessPolicy(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    
    // Attempt to read Cloudflare country code header
    let country = req.headers['cf-ipcountry'] || req.headers['x-cf-ipcountry'];
    let geo = null;

    if (!country) {
        // Fall back to GeoIP resolution
        geo = await getGeoIPData(ip);
        country = geo.country;
    }

    if (country && country !== 'IN') {
        const isLoginRoute = req.path === '/login' || req.path === '/verify-otp';
        const isAdminPanel = req.headers.referer && req.headers.referer.includes('/login');

        // Admin login blocked outside India
        if (isLoginRoute && isAdminPanel) {
            await writeSecurityEvent({
                eventType: 'Blocked Non-India Admin Login',
                riskScore: 80,
                ip,
                country,
                city: geo ? geo.city : 'Unknown',
                device: 'Admin Access Attempt',
                browser: userAgent,
                status: 'BLOCKED',
                metadata: { referer: req.headers.referer }
            });
            return res.status(403).json({ error: 'Administrative portal access is restricted to India only.' });
        }

        // Customer logins outside India must solve Turnstile CAPTCHA
        const token = req.body.turnstileToken || req.body.captchaToken;
        if (!token) {
            await writeSecurityEvent({
                eventType: 'Non-India Turnstile Required',
                riskScore: 40,
                ip,
                country,
                city: geo ? geo.city : 'Unknown',
                device: 'Customer Access Attempt',
                browser: userAgent,
                status: 'CHALLENGED',
                metadata: { path: req.path }
            });
            return res.status(202).json({
                error: 'Cross-border verification required.',
                requireChallenge: true
            });
        }

        const captcha = await verifyCaptcha(token, ip);
        if (!captcha.success) {
            await writeSecurityEvent({
                eventType: 'Cloudflare Challenge Failed',
                riskScore: 100,
                ip,
                country,
                city: geo ? geo.city : 'Unknown',
                device: 'Customer Access Attempt',
                browser: userAgent,
                status: 'BLOCKED',
                metadata: { reason: captcha.reason }
            });
            return res.status(403).json({ error: 'Verification failed. Security boundary block.' });
        }
    }

    next();
}

/**
 * Honeynet route handler.
 * Access to trap routes results in a 24-hour IP ban.
 */
async function honeynetTrap(req, res) {
    const db = require('../db');
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours

    try {
        // Apply IP ban
        await db.query(
            `INSERT INTO blocked_ips (ip, block_type, expires_at) 
             VALUES ($1, 'temporary', $2) 
             ON CONFLICT (ip) 
             DO UPDATE SET block_type = 'temporary', expires_at = $2`,
            [ip, expiresAt]
        );

        // Fetch location for logging
        const geo = await getGeoIPData(ip);

        // Log malicious scan
        await writeSecurityEvent({
            eventType: 'Honeynet Trap Triggered',
            riskScore: 100,
            ip,
            country: geo.country,
            city: geo.city,
            device: 'Scanner Bot',
            browser: userAgent,
            status: 'BLOCKED',
            metadata: { target_route: req.originalUrl }
        });
    } catch (err) {
        console.error('Failed to execute honeynet ban:', err.message);
    }

    return res.status(403).json({ error: 'Malicious request signature detected. IP temporarily blacklisted.' });
}

/**
 * Behavioral verification pre-check.
 * Evaluates client events telemetry.
 */
function behavioralCheck(req, res, next) {
    const profile = req.body.behavioralProfile || {};
    let riskPoints = 0;
    const reasons = [];

    // Check interaction profile
    if (profile.isActive === false) {
        riskPoints += 50;
        reasons.push('Idle interaction profile (+50)');
    }
    if (profile.mouseMoves === 0 && profile.scrollEvents === 0) {
        riskPoints += 30;
        reasons.push('Zero cursor movement (+30)');
    }

    // Keystroke latency consistency (Bots type with zero jitter/variance)
    if (profile.keyboardTimings && profile.keyboardTimings.length > 2) {
        const timings = profile.keyboardTimings;
        const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
        const variance = timings.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / timings.length;
        if (variance < 3) {
            riskPoints += 50;
            reasons.push('High-regularity keystroke timings (+50)');
        }
    }

    if (profile.pasteDetected) {
        riskPoints += 15;
        reasons.push('Clipboard paste execution (+15)');
    }

    req.behavioralRisk = {
        score: riskPoints,
        reasons: reasons
    };

    next();
}

module.exports = {
    indiaAccessPolicy,
    honeynetTrap,
    behavioralCheck
};
