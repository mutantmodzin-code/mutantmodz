const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Get all customers
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search customer by phone
router.get('/search', authenticateToken, async (req, res) => {
    const { phone } = req.query;
    try {
        const result = await db.query('SELECT * FROM customers WHERE phone = $1', [phone]);
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add customer
router.post('/', async (req, res) => {
    const { name, phone, email, address } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO customers (name, phone, email, address) VALUES ($1, $2, $3, $4) ON CONFLICT (phone) DO UPDATE SET name = $1, email = $3, address = $4 RETURNING *',
            [name, phone, email, address]
        );
        res.status(201).json(result.rows[0]);
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
