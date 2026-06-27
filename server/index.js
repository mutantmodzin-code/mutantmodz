const express = require('express');
// Triggering restart v5
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable proxy trust to support Cloudflare connecting IP extraction
app.set('trust proxy', true);

// ==========================================
// RATE LIMITERS (HTTP-layer, independent of Redis)
// ==========================================

// Global rate limiter: 100 requests per 15 minutes per IP
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP. Please try again later.' },
    skip: (req) => {
        // Allow health check and static asset routes
        return req.path === '/' || req.path.startsWith('/uploads/');
    }
});

// Strict OTP-specific limiter: 3 requests per 15 minutes per IP
const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many OTP requests. Please wait 15 minutes before requesting another code.' }
});

// Admin login strict limiter: 5 attempts per 15 minutes
const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts. Please wait 15 minutes.' }
});


console.log('--- Server Debug ---');
console.log('PORT:', PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
console.log('MAILERSEND_API_KEY:', process.env.MAILERSEND_API_KEY ? 'PRESENT' : 'MISSING');
console.log('TURNSTILE_SECRET_KEY:', process.env.TURNSTILE_SECRET_KEY ? 'PRESENT ✅' : 'MISSING ⚠️');
console.log('RECAPTCHA_SECRET_KEY:', process.env.RECAPTCHA_SECRET_KEY ? 'PRESENT ✅' : 'MISSING ⚠️');
console.log('--------------------');




// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1y',
    immutable: true,
    etag: true
}));

// Honeynet trap endpoints (Express v5 RegExp matches)
const { honeynetTrap } = require('./middleware/enterpriseSecurity');
app.all(/^\/wp-admin.*/, honeynetTrap);
app.all(/^\/phpmyadmin.*/, honeynetTrap);
app.all(/^\/\.env.*/, honeynetTrap);
app.all(/^\/admin\.php.*/, honeynetTrap);
app.all(/^\/config\.php.*/, honeynetTrap);

// Apply global rate limiter to all API routes
app.use('/api/', globalLimiter);



// Main Route Check
app.get('/', (req, res) => {
    res.json({ message: 'Bike Accessories Pitshop API is running' });
});

// Import Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const customerRoutes = require('./routes/customers');
const invoiceRoutes = require('./routes/invoices');
const reportRoutes = require('./routes/reports');

const vendorRoutes = require('./routes/vendors');
const gstRoutes = require('./routes/gst');
const notificationRoutes = require('./routes/notifications');
const testOrderRoutes = require('./routes/test-orders');
const comboRoutes = require('./routes/combos');
const garageSaleRoutes = require('./routes/garage_sale');
const deliveryChargeRoutes = require('./routes/delivery_charge');
const contactRoutes = require('./routes/contact');
const reelRoutes = require('./routes/reels');
const heroRoutes = require('./routes/hero');
const promoRoutes = require('./routes/promo');

// Apply specific route rate limiters BEFORE registering the auth route
// (Express processes middleware in registration order)
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth/login', adminLoginLimiter);

// Apply Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/test-orders', testOrderRoutes);
app.use('/api/combos', comboRoutes);
app.use('/api/garage-sale', garageSaleRoutes);
app.use('/api/delivery-charge', deliveryChargeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/promo', promoRoutes);




// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

if (process.env.NODE_ENV !== 'production' || process.env.FORCE_LISTEN === 'true') {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}

module.exports = app;
