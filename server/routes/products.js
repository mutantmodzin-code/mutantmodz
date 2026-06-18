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

const { cloudinary } = require('../utils/cloudinary');

// Add Product
router.post('/', async (req, res) => {
    let { 
        name, brand, category_id, sub_category, sub_category_type, 
        price, stock, vendor_id, sku, purchase_price, image_url, 
        bike_brand, bike_model, description, discount_percent, 
        is_garage_sale, is_combo, combo_type,
        delivery_tn, delivery_south, delivery_north,
        size_stock
    } = req.body;

    // Robust size_stock parsing for backend
    let processedSizeStock = size_stock;
    if (size_stock && typeof size_stock === 'string') {
        try { processedSizeStock = JSON.parse(size_stock); } catch (e) { processedSizeStock = null; }
    }

    // If size_stock provided, compute total stock from it
    if (processedSizeStock && typeof processedSizeStock === 'object' && Object.keys(processedSizeStock).length > 0) {
        const totalFromSizes = Object.values(processedSizeStock).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
        stock = totalFromSizes;
    }
    const sizeStockJson = (processedSizeStock && typeof processedSizeStock === 'object' && Object.keys(processedSizeStock).length > 0)
        ? processedSizeStock
        : null;

    // If it's a base64 string or an array of base64 strings, upload to Cloudinary
    try {
        if (image_url) {
            let images = [];
            try {
                const parsed = JSON.parse(image_url);
                images = Array.isArray(parsed) ? parsed : [image_url];
            } catch (e) {
                images = [image_url];
            }

            const uploadedImages = await Promise.all(images.map(async (img) => {
                if (typeof img === 'string' && img.startsWith('data:image')) {
                    const uploadRes = await cloudinary.uploader.upload(img, {
                        folder: 'mutantmodz/products'
                    });
                    return uploadRes.secure_url;
                }
                return img;
            }));

            image_url = uploadedImages.length > 1 ? JSON.stringify(uploadedImages) : uploadedImages[0];
        }
    } catch (uploadErr) {
        console.error('Cloudinary upload failed for product:', uploadErr);
    }

    console.log('DEBUG: Attempting to add product:', { name, sku, price, is_garage_sale, is_combo, combo_type });

    // Duplicate check for Name and SKU
    try {
        const duplicateCheck = await db.query('SELECT name, sku FROM products WHERE LOWER(name) = LOWER($1) OR (sku = $2 AND $2 IS NOT NULL AND $2 != \'\')', [name, sku]);
        if (duplicateCheck.rows.length > 0) {
            const dup = duplicateCheck.rows[0];
            const field = dup.name.toLowerCase() === name.toLowerCase() ? 'Name' : 'SKU';
            return res.status(400).json({ error: `Duplicate detected: A product with this ${field} already exists.` });
        }
    } catch (err) {
        console.error('Duplicate check failed:', err);
    }

    const finalSku = sku || `SKU-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    try {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const result = await client.query(
                'INSERT INTO products (name, brand, category_id, sub_category, sub_category_type, price, stock, vendor_id, sku, purchase_price, image_url, bike_brand, bike_model, description, discount_percent, is_garage_sale, is_combo, combo_type, delivery_tn, delivery_south, delivery_north, size_stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22::jsonb) RETURNING *',
                [
                    name, brand, category_id ? parseInt(category_id) : null,
                    sub_category || null, sub_category_type || null,
                    parseFloat(price) || 0, parseInt(stock) || 0,
                    vendor_id ? parseInt(vendor_id) : null,
                    finalSku, parseFloat(purchase_price) || 0, image_url || null,
                    bike_brand || null, bike_model || null, description || null,
                    parseFloat(discount_percent) || 0, is_garage_sale || false,
                    is_combo || false, combo_type || null,
                    parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0,
                    sizeStockJson ? JSON.stringify(sizeStockJson) : null
                ]
            );

            const productId = result.rows[0].id;
            await client.query(
                'INSERT INTO product_vendor_prices (product_id, vendor_id, purchase_price, selling_price) VALUES ($1, $2, $3, $4)',
                [productId, vendor_id ? parseInt(vendor_id) : null, parseFloat(purchase_price) || 0, parseFloat(price) || 0]
            );

            if (is_garage_sale) {
                let imagesArr = [];
                let mainImage = null;
                try {
                    if (image_url) {
                        const parsed = JSON.parse(image_url);
                        imagesArr = Array.isArray(parsed) ? parsed : [image_url];
                        mainImage = imagesArr[0] || null;
                    }
                } catch (e) {
                    mainImage = image_url;
                    imagesArr = [image_url];
                }

                await client.query(
                    'INSERT INTO garage_sale (name, brand, sku, price, stock, image_url, images, description, garage_sale_type, linked_items, delivery_tn, delivery_south, delivery_north, discount_percent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                    [
                        name, brand, finalSku, parseFloat(price) || 0, parseInt(stock) || 0, 
                        mainImage, imagesArr, description, 
                        'Today\'s Offer', [], 
                        parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0,
                        parseFloat(discount_percent) || 0
                    ]
                );
            }

            if (is_combo) {
                let imagesArr = [];
                let mainImage = null;
                try {
                    if (image_url) {
                        const parsed = JSON.parse(image_url);
                        imagesArr = Array.isArray(parsed) ? parsed : [image_url];
                        mainImage = imagesArr[0] || null;
                    }
                } catch (e) {
                    mainImage = image_url;
                    imagesArr = [image_url];
                }

                await client.query(
                    'INSERT INTO combos (name, brand, sku, price, stock, image_url, images, description, combo_type, linked_items, delivery_tn, delivery_south, delivery_north, discount_percent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                    [
                        name, brand, finalSku, parseFloat(price) || 0, parseInt(stock) || 0, 
                        mainImage, imagesArr, description, 
                        combo_type || 'General Combos', [], 
                        parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0,
                        parseFloat(discount_percent) || 0
                    ]
                );
            }

            await client.query('COMMIT');
            res.status(201).json(result.rows[0]);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
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
    let { 
        name, brand, category_id, sub_category, sub_category_type, 
        price, stock, vendor_id, sku, purchase_price, image_url, 
        bike_brand, bike_model, description, discount_percent, 
        is_garage_sale, is_combo, combo_type,
        delivery_tn, delivery_south, delivery_north,
        size_stock
    } = req.body;

    try {
        const fs = require('fs');
        fs.appendFileSync('server_debug.log', `[${new Date().toISOString()}] UPDATING PRODUCT ${req.params.id}\nBODY: ${JSON.stringify(req.body)}\n`);
    } catch (fsErr) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to write product update log:', fsErr.message);
        }
    }
    console.log(`Updating product ${req.params.id}. Incoming stock: ${stock}, size_stock:`, size_stock);

    // Robust size_stock parsing for backend
    let processedSizeStock = size_stock;
    if (size_stock && typeof size_stock === 'string') {
        try { processedSizeStock = JSON.parse(size_stock); } catch (e) { processedSizeStock = null; }
    }

    // If size_stock provided, compute total stock from it
    if (processedSizeStock && typeof processedSizeStock === 'object' && Object.keys(processedSizeStock).length > 0) {
        const totalFromSizes = Object.values(processedSizeStock).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
        stock = totalFromSizes;
    }
    const sizeStockJsonPut = (processedSizeStock && typeof processedSizeStock === 'object' && Object.keys(processedSizeStock).length > 0)
        ? processedSizeStock
        : null;


    // If it's a base64 string or an array of base64 strings, upload to Cloudinary
    try {
        if (image_url) {
            let images = [];
            try {
                const parsed = JSON.parse(image_url);
                images = Array.isArray(parsed) ? parsed : [image_url];
            } catch (e) {
                images = [image_url];
            }

            const uploadedImages = await Promise.all(images.map(async (img) => {
                if (typeof img === 'string' && img.startsWith('data:image')) {
                    const uploadRes = await cloudinary.uploader.upload(img, {
                        folder: 'mutantmodz/products'
                    });
                    return uploadRes.secure_url;
                }
                return img;
            }));

            image_url = uploadedImages.length > 1 ? JSON.stringify(uploadedImages) : uploadedImages[0];
        }
    } catch (uploadErr) {
        console.error('Cloudinary upload failed for product update:', uploadErr);
    }

    const { id } = req.params;

    // Duplicate check for Name and SKU (excluding current product)
    try {
        const duplicateCheck = await db.query('SELECT name, sku FROM products WHERE (LOWER(name) = LOWER($1) OR (sku = $2 AND $2 IS NOT NULL AND $2 != \'\')) AND id != $3', [name, sku, id]);
        if (duplicateCheck.rows.length > 0) {
            const dup = duplicateCheck.rows[0];
            const field = dup.name.toLowerCase() === name.toLowerCase() ? 'Name' : 'SKU';
            return res.status(400).json({ error: `Duplicate detected: Another product with this ${field} already exists.` });
        }
    } catch (err) {
        console.error('Duplicate check failed:', err);
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const result = await client.query(
            'UPDATE products SET name=$1, brand=$2, category_id=$3, sub_category=$4, sub_category_type=$5, price=$6, stock=$7, vendor_id=$8, sku=$9, purchase_price=$10, image_url=$11, bike_brand=$12, bike_model=$13, description=$14, discount_percent=$15, is_garage_sale=$16, is_combo=$17, combo_type=$18, delivery_tn=$19, delivery_south=$20, delivery_north=$21, size_stock=$22::jsonb WHERE id=$23 RETURNING *',
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
                sizeStockJsonPut ? JSON.stringify(sizeStockJsonPut) : null,
                id
            ]
        );

        console.log(`Product ${id} updated in DB. New stock: ${result.rows[0].stock}, size_stock:`, result.rows[0].size_stock);

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Product not found' });
        }

        // Optional: Update price history if changed
        await client.query(
            'INSERT INTO product_vendor_prices (product_id, vendor_id, purchase_price, selling_price) VALUES ($1, $2, $3, $4)',
            [id, vendor_id || null, purchase_price || 0, price]
        );

        // AUTO-INTEGRATION: Sync with garage_sale table
        const existingGs = await client.query('SELECT id FROM garage_sale WHERE sku = $1', [sku]);
        if (existingGs.rows.length > 0 || is_garage_sale) {
            let imagesArr = [];
            let mainImage = null;
            try {
                if (image_url) {
                    const parsed = JSON.parse(image_url);
                    imagesArr = Array.isArray(parsed) ? parsed : [image_url];
                    mainImage = imagesArr[0] || null;
                }
            } catch (e) {
                mainImage = image_url;
                imagesArr = [image_url];
            }

            if (existingGs.rows.length > 0) {
                await client.query(
                    'UPDATE garage_sale SET name=$1, brand=$2, price=$3, stock=$4, image_url=$5, images=$6, description=$7, delivery_tn=$8, delivery_south=$9, delivery_north=$10, discount_percent=$11, updated_at=CURRENT_TIMESTAMP WHERE sku=$12',
                    [
                        name, brand, parseFloat(price) || 0, parseInt(stock) || 0, 
                        mainImage, imagesArr, description, 
                        parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0,
                        parseFloat(discount_percent) || 0,
                        sku
                    ]
                );
            } else if (is_garage_sale) {
                await client.query(
                    'INSERT INTO garage_sale (name, brand, sku, price, stock, image_url, images, description, garage_sale_type, linked_items, delivery_tn, delivery_south, delivery_north, discount_percent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                    [
                        name, brand, sku, parseFloat(price) || 0, parseInt(stock) || 0, 
                        mainImage, imagesArr, description, 
                        'Today\'s Offer', [], 
                        parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0,
                        parseFloat(discount_percent) || 0
                    ]
                );
            }
        }

        // AUTO-INTEGRATION: Sync with combos table
        if (is_combo) {
            let imagesArr = [];
            let mainImage = null;
            try {
                if (image_url) {
                    const parsed = JSON.parse(image_url);
                    imagesArr = Array.isArray(parsed) ? parsed : [image_url];
                    mainImage = imagesArr[0] || null;
                }
            } catch (e) {
                mainImage = image_url;
                imagesArr = [image_url];
            }

            // Check if exists by SKU
            const existingCombo = await client.query('SELECT id FROM combos WHERE sku = $1', [sku]);
            if (existingCombo.rows.length > 0) {
                await client.query(
                    'UPDATE combos SET name=$1, brand=$2, price=$3, stock=$4, image_url=$5, images=$6, description=$7, combo_type=$8, delivery_tn=$9, delivery_south=$10, delivery_north=$11, discount_percent=$12, updated_at=CURRENT_TIMESTAMP WHERE sku=$13',
                    [
                        name, brand, parseFloat(price) || 0, parseInt(stock) || 0, 
                        mainImage, imagesArr, description, 
                        combo_type || 'General Combos', 
                        parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0,
                        parseFloat(discount_percent) || 0,
                        sku
                    ]
                );
            } else {
                await client.query(
                    'INSERT INTO combos (name, brand, sku, price, stock, image_url, images, description, combo_type, linked_items, delivery_tn, delivery_south, delivery_north, discount_percent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)',
                    [
                        name, brand, sku, parseFloat(price) || 0, parseInt(stock) || 0, 
                        mainImage, imagesArr, description, 
                        combo_type || 'General Combos', [], 
                        parseFloat(delivery_tn) || 0, parseFloat(delivery_south) || 0, parseFloat(delivery_north) || 0,
                        parseFloat(discount_percent) || 0
                    ]
                );
            }
        }

        await client.query('COMMIT');
        res.json(result.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error on PUT /api/products/:id:', error);
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
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
