const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('./auth');

// Get all customers with online/offline classification
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT
                c.*,
                COUNT(i.id) AS total_orders,
                COALESCE(SUM(i.total_amount), 0) AS total_spent,
                MAX(i.created_at) AS last_order_at,
                CASE
                    WHEN c.is_verified = true THEN 'online'
                    WHEN COUNT(CASE WHEN i.order_type = 'Online Order' THEN 1 END) > 0 THEN 'online'
                    ELSE 'offline'
                END AS customer_type
            FROM customers c
            LEFT JOIN invoices i ON i.customer_id = c.id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search customer by phone
router.get('/search', async (req, res) => {
    const { phone } = req.query;
    try {
        const result = await db.query('SELECT * FROM customers WHERE phone = $1', [phone]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add customer (Registration/Initial)
router.post('/', async (req, res) => {
    const { name, phone, email, address } = req.body;

    // Validate email format
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!email || !gmailRegex.test(email)) {
        return res.status(400).json({ error: 'Only Gmail addresses are supported.' });
    }

    // Reject disposable email domains
    const domain = email.split('@')[1].toLowerCase();
    const disposableDomains = ['tempmail.com', 'mailinator.com', 'guerrillamail.com', '10minutemail.com'];
    if (disposableDomains.includes(domain)) {
        return res.status(400).json({ error: 'Only Gmail addresses are supported.' });
    }

    try {
        // Prevent duplicate accounts: check email
        const existingEmail = await db.query('SELECT id FROM customers WHERE email = $1', [email]);
        if (existingEmail.rows.length > 0) {
            return res.status(400).json({ error: 'Account already exists.' });
        }

        const existingEmailAdmin = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existingEmailAdmin.rows.length > 0) {
            return res.status(400).json({ error: 'Account already exists.' });
        }

        // Prevent duplicate accounts: check phone
        const existingPhone = await db.query('SELECT id FROM customers WHERE phone = $1', [phone]);
        if (existingPhone.rows.length > 0) {
            return res.status(400).json({ error: 'Account already exists.' });
        }

        const existingPhoneAdmin = await db.query('SELECT id FROM users WHERE phone = $1', [phone]);
        if (existingPhoneAdmin.rows.length > 0) {
            return res.status(400).json({ error: 'Account already exists.' });
        }

        // Do not create the user account until OTP verification succeeds.
        // Save pending registration details first.
        const result = await db.query(
            `INSERT INTO pending_registrations (name, phone, email, address) 
             VALUES ($1, $2, $3, $4) 
             ON CONFLICT (phone) 
             DO UPDATE SET name = $1, email = $3, address = $4 
             RETURNING *`,
            [name, phone, email, address || '']
        );
        
        const pendingUser = result.rows[0];

        res.status(201).json({
            pending: true,
            user: {
                name: pendingUser.name,
                email: pendingUser.email,
                phone: pendingUser.phone
            }
        });
    } catch (error) {
        console.error('CUSTOMER REGISTRATION ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update profile
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, phone, address } = req.body;
    
    // Security check: Customer can only update their own profile
    if (req.user.role !== 'admin' && req.user.id.toString() !== id.toString()) {
        return res.status(403).json({ error: 'Unauthorized profile update' });
    }

    try {
        const result = await db.query(
            'UPDATE customers SET name = $1, phone = $2, address = $3 WHERE id = $4 RETURNING *',
            [name, phone, address, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        
        const user = result.rows[0];
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get customer purchase history
router.get('/:id/history', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM invoices WHERE customer_id = $1 ORDER BY created_at DESC',
            [id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
