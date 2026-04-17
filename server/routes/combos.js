const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all combos
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM combos ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new combo
router.post('/', async (req, res) => {
    const { name, brand, sku, price, stock, image_url, images, description, combo_type, linked_items, delivery_tn, delivery_south, delivery_north } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO combos (name, brand, sku, price, stock, image_url, images, description, combo_type, linked_items, delivery_tn, delivery_south, delivery_north) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [name, brand, sku || null, parseFloat(price) || 0, parseInt(stock) || 0, image_url, images || [], description, combo_type, JSON.stringify(linked_items || []), parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a combo
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, brand, sku, price, stock, image_url, images, description, combo_type, is_active, linked_items, delivery_tn, delivery_south, delivery_north } = req.body;
    try {
        const result = await db.query(
            'UPDATE combos SET name=$1, brand=$2, sku=$3, price=$4, stock=$5, image_url=$6, images=$7, description=$8, combo_type=$9, is_active=$10, linked_items=$11, delivery_tn=$12, delivery_south=$13, delivery_north=$14, updated_at=CURRENT_TIMESTAMP WHERE id=$15 RETURNING *',
            [name, brand, sku || null, parseFloat(price) || 0, parseInt(stock) || 0, image_url, images || [], description, combo_type, is_active !== undefined ? is_active : true, JSON.stringify(linked_items || []), parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Combo not found' });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a combo
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM combos WHERE id = $1', [id]);
        res.json({ message: 'Combo deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
