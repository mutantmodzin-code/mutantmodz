const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all garage sale items
router.get('/', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                gs.*,
                COALESCE(p.discount_percent, gs.discount_percent) as discount_percent,
                p.size_stock,
                p.sub_category,
                p.sub_category_type,
                c.name as category_name
            FROM garage_sale gs
            LEFT JOIN products p ON p.sku = gs.sku
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY gs.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a new garage sale item
router.post('/', async (req, res) => {
    const { name, brand, sku, price, stock, image_url, images, description, garage_sale_type, linked_items, delivery_tn, delivery_south, delivery_north, discount_percent } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO garage_sale (name, brand, sku, price, stock, image_url, images, description, garage_sale_type, linked_items, delivery_tn, delivery_south, delivery_north, discount_percent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *',
            [name, brand, sku || null, parseFloat(price) || 0, parseInt(stock) || 0, image_url, images || [], description, garage_sale_type, JSON.stringify(linked_items || []), parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0, parseFloat(discount_percent) || 0]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a garage sale item
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    console.log('UPDATING GARAGE SALE ITEM:', id);
    const { name, brand, sku, price, stock, image_url, images, description, garage_sale_type, is_active, linked_items, delivery_tn, delivery_south, delivery_north, discount_percent } = req.body;
    try {
        const result = await db.query(
            'UPDATE garage_sale SET name=$1, brand=$2, sku=$3, price=$4, stock=$5, image_url=$6, images=$7, description=$8, garage_sale_type=$9, is_active=$10, linked_items=$11, delivery_tn=$12, delivery_south=$13, delivery_north=$14, discount_percent=$15, updated_at=CURRENT_TIMESTAMP WHERE id=$16 RETURNING *',
            [name, brand, sku || null, parseFloat(price) || 0, parseInt(stock) || 0, image_url, images || [], description, garage_sale_type, is_active !== undefined ? is_active : true, JSON.stringify(linked_items || []), parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0, parseFloat(discount_percent) || 0, id]
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
