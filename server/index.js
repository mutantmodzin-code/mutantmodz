const express = require('express');
// Triggering restart
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('--- Server Debug ---');
console.log('PORT:', PORT);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');
console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'PRESENT' : 'MISSING');
console.log('--------------------');



// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


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

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`);
    });
}

module.exports = app;
