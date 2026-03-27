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
console.log('--------------------');

// Middleware
app.use(cors());
app.use(helmet());
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

// Apply Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
