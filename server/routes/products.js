const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Get all products (with optional filtering)
router.get('/', async (req, res) => {
    const { category, brand, search, sku, bike_brand, bike_model, new: isNew } = req.query;
    let query = 'SELECT p.*, c.name as category_name, v.name as vendor_name FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN vendors v ON p.vendor_id = v.id';
    let values = [];
    let conditions = [];

    // New arrivals: products added in last 10 days
    if (isNew === 'true') {
        conditions.push(`p.created_at >= NOW() - INTERVAL '10 days'`);
    }
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

    if (isNew === 'true') {
        query += ' ORDER BY p.created_at DESC';
    }

    try {
        const result = await db.query(query, values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Dedicated New Arrivals endpoint (last 10 days)
router.get('/new-arrivals', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT p.*, c.name as category_name, v.name as vendor_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LEFT JOIN vendors v ON p.vendor_id = v.id
            WHERE p.created_at >= NOW() - INTERVAL '10 days'
            ORDER BY p.created_at DESC
        `);
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
    const { 
        name, brand, category_id, sub_category, sub_category_type, 
        price, stock, vendor_id, sku, purchase_price, image_url, 
        bike_brand, bike_model, description, discount_percent, 
        is_garage_sale, is_combo, combo_type,
        delivery_tn, delivery_south, delivery_north 
    } = req.body;
    console.log('DEBUG: Attempting to add product:', { name, sku, price, is_garage_sale, is_combo, combo_type });

    try {
        // Auto-generate unique SKU if not provided
        const finalSku = sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const result = await db.query(
            'INSERT INTO products (name, brand, category_id, sub_category, sub_category_type, price, stock, vendor_id, sku, purchase_price, image_url, bike_brand, bike_model, description, discount_percent, is_garage_sale, is_combo, combo_type, delivery_tn, delivery_south, delivery_north) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21) RETURNING *',
            [
                name,
                brand,
                category_id ? parseInt(category_id) : null,
                sub_category || null,
                sub_category_type || null,
                parseFloat(price) || 0,
                parseInt(stock) || 0,
                vendor_id ? parseInt(vendor_id) : null,
                finalSku,
                parseFloat(purchase_price) || 0,
                image_url || null,
                bike_brand || null,
                bike_model || null,
                description || null,
                parseFloat(discount_percent) || 0,
                is_garage_sale || false,
                is_combo || false,
                combo_type || null,
                parseFloat(delivery_tn) || 0,
                parseFloat(delivery_south) || 0,
                parseFloat(delivery_north) || 0
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
    const { 
        name, brand, category_id, sub_category, sub_category_type, 
        price, stock, vendor_id, sku, purchase_price, image_url, 
        bike_brand, bike_model, description, discount_percent, 
        is_garage_sale, is_combo, combo_type,
        delivery_tn, delivery_south, delivery_north 
    } = req.body;
    const { id } = req.params;
    try {
        const result = await db.query(
            'UPDATE products SET name=$1, brand=$2, category_id=$3, sub_category=$4, sub_category_type=$5, price=$6, stock=$7, vendor_id=$8, sku=$9, purchase_price=$10, image_url=$11, bike_brand=$12, bike_model=$13, description=$14, discount_percent=$15, is_garage_sale=$16, is_combo=$17, combo_type=$18, delivery_tn=$19, delivery_south=$20, delivery_north=$21 WHERE id=$22 RETURNING *',
            [
                name,
                brand,
                category_id ? parseInt(category_id) : null,
                sub_category || null,
                sub_category_type || null,
                parseFloat(price) || 0,
                parseInt(stock) || 0,
                vendor_id ? parseInt(vendor_id) : null,
                sku || null,
                parseFloat(purchase_price) || 0,
                image_url || null,
                bike_brand || null,
                bike_model || null,
                description || null,
                parseFloat(discount_percent) || 0,
                is_garage_sale || false,
                is_combo || false,
                combo_type || null,
                parseFloat(delivery_tn) || 0,
                parseFloat(delivery_south) || 0,
                parseFloat(delivery_north) || 0,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Optional: Update price history if changed
        await db.query(
            'INSERT INTO product_vendor_prices (product_id, vendor_id, purchase_price, selling_price) VALUES ($1, $2, $3, $4)',
            [id, vendor_id || null, purchase_price || 0, price]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error on PUT /api/products/:id:', error);
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
