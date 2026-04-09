const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all garage sale items
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM garage_sale ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new garage sale item
router.post('/', async (req, res) => {
    const { name, brand, price, stock, image_url, images, description, garage_sale_type, linked_items } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO garage_sale (name, brand, price, stock, image_url, images, description, garage_sale_type, linked_items) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [name, brand, parseFloat(price) || 0, parseInt(stock) || 0, image_url, images || [], description, garage_sale_type, JSON.stringify(linked_items || [])]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a garage sale item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, brand, price, stock, image_url, images, description, garage_sale_type, is_active, linked_items } = req.body;
    try {
        const result = await db.query(
            'UPDATE garage_sale SET name=$1, brand=$2, price=$3, stock=$4, image_url=$5, images=$6, description=$7, garage_sale_type=$8, is_active=$9, linked_items=$10, updated_at=CURRENT_TIMESTAMP WHERE id=$11 RETURNING *',
            [name, brand, parseFloat(price) || 0, parseInt(stock) || 0, image_url, images || [], description, garage_sale_type, is_active !== undefined ? is_active : true, JSON.stringify(linked_items || []), id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a garage sale item
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM garage_sale WHERE id = $1', [id]);
        res.json({ message: 'Garage sale item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
