const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Get all products (with optional filtering)
router.get('/', async (req, res) => {
    const { category, brand, search, sku, bike_brand, bike_model } = req.query;
    let query = 'SELECT p.*, c.name as category_name, v.name as vendor_name FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN vendors v ON p.vendor_id = v.id';
    let values = [];
    let conditions = [];

    if (category) {
        conditions.push('c.id = $' + (values.length + 1));
        values.push(category);
    }
    if (brand) {
        conditions.push('p.brand ILIKE $' + (values.length + 1));
        values.push(`%${brand}%`);
    }
    if (sku) {
        conditions.push('p.sku = $' + (values.length + 1));
        values.push(sku);
    }
    if (bike_brand) {
        conditions.push('p.bike_brand = $' + (values.length + 1));
        values.push(bike_brand);
    }
    if (bike_model) {
        conditions.push('p.bike_model = $' + (values.length + 1));
        values.push(bike_model);
    }
    if (search) {
        const searchTerms = search.split(/\s+/).filter(t => t.length > 0);
        searchTerms.forEach(term => {
            const placeholder = '$' + (values.length + 1);
            conditions.push(`(p.name ILIKE ${placeholder} OR p.sku ILIKE ${placeholder} OR p.description ILIKE ${placeholder} OR p.brand ILIKE ${placeholder} OR p.bike_brand ILIKE ${placeholder} OR p.bike_model ILIKE ${placeholder} OR p.sub_category ILIKE ${placeholder} OR c.name ILIKE ${placeholder})`);
            values.push(`%${term}%`);
        });
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    try {
        const result = await db.query(query, values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Categories
router.get('/categories', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories');
        res.json(result.rows);
    } catch (error) {
        console.error('CRITICAL: Categories fetch failed:', error);
        res.status(500).json({ error: error.message });
    }
});

// Add Product
router.post('/', async (req, res) => {
    const { name, category_id, brand, price, stock, vendor_id, sku, purchase_price, image_url, bike_brand, bike_model, description, sub_category, sub_category_type, discount_percent, is_garage_sale } = req.body;
    console.log('DEBUG: Attempting to add product:', { name, sku, price, is_garage_sale });

    try {
        const result = await db.query(
            'INSERT INTO products (name, category_id, brand, price, stock, vendor_id, sku, purchase_price, image_url, bike_brand, bike_model, description, sub_category, sub_category_type, discount_percent, is_garage_sale) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *',
            [
                name,
                category_id ? parseInt(category_id) : null,
                brand,
                parseFloat(price) || 0,
                parseInt(stock) || 0,
                vendor_id ? parseInt(vendor_id) : null,
                sku || null,
                parseFloat(purchase_price) || 0,
                image_url || null,
                bike_brand || null,
                bike_model || null,
                description || null,
                sub_category || null,
                sub_category_type || null,
                parseFloat(discount_percent) || 0,
                is_garage_sale || false
            ]
        );


        // Log vendor price history
        if (result.rows[0].id) {
            await db.query(
                'INSERT INTO product_vendor_prices (product_id, vendor_id, purchase_price, selling_price) VALUES ($1, $2, $3, $4)',
                [
                    result.rows[0].id,
                    vendor_id ? parseInt(vendor_id) : null,
                    parseFloat(purchase_price) || 0,
                    parseFloat(price) || 0
                ]
            );
        }

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('CRITICAL ERROR on POST /api/products:', error);
        res.status(500).json({
            error: error.message,
            detail: error.detail,
            table: error.table,
            constraint: error.constraint
        });
    }
});

// Update Product
router.put('/:id', async (req, res) => {
    const { name, category_id, brand, price, stock, vendor_id, sku, purchase_price, image_url, bike_brand, bike_model, description, sub_category, sub_category_type, discount_percent, is_garage_sale } = req.body;

    const { id } = req.params;
    try {
        const result = await db.query(
            'UPDATE products SET name = $1, category_id = $2, brand = $3, price = $4, stock = $5, vendor_id = $6, sku = $7, purchase_price = $8, image_url = $9, bike_brand = $10, bike_model = $11, description = $12, sub_category = $13, sub_category_type = $14, discount_percent = $15, is_garage_sale = $16 WHERE id = $17 RETURNING *',
            [
                name,
                category_id ? parseInt(category_id) : null,
                brand,
                parseFloat(price) || 0,
                parseInt(stock) || 0,
                vendor_id ? parseInt(vendor_id) : null,
                sku || null,
                parseFloat(purchase_price) || 0,
                image_url || null,
                bike_brand || null,
                bike_model || null,
                description || null,
                sub_category || null,
                sub_category_type || null,
                parseFloat(discount_percent) || 0,
                is_garage_sale || false,
                id
            ]
        );


        // Optional: Update price history if changed
        await db.query(
            'INSERT INTO product_vendor_prices (product_id, vendor_id, purchase_price, selling_price) VALUES ($1, $2, $3, $4)',
            [id, vendor_id || null, purchase_price || 0, price]
        );

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Stock Manually
router.patch('/:id/inventory', async (req, res) => {
    const { amount, type, reason } = req.body;
    const { id } = req.params;
    try {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            const updateQuery = (type === 'addition') ?
                'UPDATE products SET stock = stock + $1 WHERE id = $2 RETURNING stock' :
                'UPDATE products SET stock = stock - $1 WHERE id = $2 RETURNING stock';
            const updatedProduct = await client.query(updateQuery, [amount, id]);

            await client.query(
                'INSERT INTO inventory (product_id, change_amount, type, reason) VALUES ($1, $2, $3, $4)',
                [id, amount, type, reason]
            );
            await client.query('COMMIT');
            res.json({ stock: updatedProduct.rows[0]?.stock });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM products WHERE id = $1', [id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
