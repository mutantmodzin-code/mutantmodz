const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Get all vendors
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM vendors ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get vendor by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM vendors WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new vendor
router.post('/', authenticateToken, async (req, res) => {
    const { name, contact_person, phone, email, address } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO vendors (name, contact_person, phone, email, address) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, contact_person, phone, email, address]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update vendor
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, contact_person, phone, email, address } = req.body;
    try {
        const result = await db.query(
            'UPDATE vendors SET name = $1, contact_person = $2, phone = $3, email = $4, address = $5 WHERE id = $6 RETURNING *',
            [name, contact_person, phone, email, address, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete vendor
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM vendors WHERE id = $1', [id]);
        res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
