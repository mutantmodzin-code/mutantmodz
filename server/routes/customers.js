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
    const { name, phone, email, address, is_verified } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO customers (name, phone, email, address, is_verified) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (phone) DO UPDATE SET name = $1, email = $3, address = $4, is_verified = EXCLUDED.is_verified RETURNING *',
            [name, phone, email, address, is_verified || false]
        );
        
        const user = result.rows[0];
        
        // Generate token for immediate login after registration
        const token = jwt.sign(
            { id: user.id, username: user.name, role: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone
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
