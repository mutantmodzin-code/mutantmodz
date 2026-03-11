const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Create Invoice
router.post('/', async (req, res) => {
    const {
        customer_id,
        items,
        subtotal,
        tax,
        discount,
        total_amount,
        payment_method,
        order_type, // 'Online Order' or 'Offline Order'
        gst_percentage,
        cgst_amount,
        sgst_amount,
        igst_amount,
        taxable_value,
        total_gst
    } = req.body;

    try {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Safety Check: Verify all products have enough stock
            for (const item of items) {
                const prodRes = await client.query('SELECT stock, name FROM products WHERE id = $1', [item.product_id]);
                const currentStock = prodRes.rows[0]?.stock || 0;
                if (currentStock < item.quantity) {
                    throw new Error(`Insufficient stock for ${prodRes.rows[0]?.name || 'Product'}. Available: ${currentStock}, Requested: ${item.quantity}`);
                }
            }

            // 2. Insert Invoice
            const invoiceResult = await client.query(
                `INSERT INTO invoices (
                    customer_id, subtotal, tax, discount, total_amount, payment_method, order_type,
                    gst_percentage, cgst_amount, sgst_amount, igst_amount, taxable_value, total_gst
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
                [
                    customer_id, subtotal, tax, discount, total_amount, payment_method, order_type || 'Offline Order',
                    gst_percentage || 0, cgst_amount || 0, sgst_amount || 0, igst_amount || 0,
                    taxable_value || subtotal, total_gst || tax
                ]
            );
            const invoiceId = invoiceResult.rows[0].id;

            for (const item of items) {
                let purchase_price = item.purchase_price;
                if (purchase_price === undefined) {
                    const prodRes = await client.query('SELECT purchase_price FROM products WHERE id = $1', [item.product_id]);
                    purchase_price = prodRes.rows[0]?.purchase_price || 0;
                }

                await client.query(
                    `INSERT INTO invoice_items (
                        invoice_id, product_id, quantity, unit_price, line_total, purchase_price,
                        gst_percentage, cgst_amount, sgst_amount, igst_amount, taxable_amount
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                    [
                        invoiceId, item.product_id, item.quantity, item.unit_price, item.line_total, purchase_price,
                        item.gst_percentage || 0, item.cgst_amount || 0, item.sgst_amount || 0,
                        item.igst_amount || 0, item.taxable_amount || item.line_total
                    ]
                );

                // 3. Deduct Stock
                await client.query(
                    'UPDATE products SET stock = stock - $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );

                // 4. Log Inventory
                await client.query(
                    'INSERT INTO inventory (product_id, change_amount, type, reason) VALUES ($1, $2, $3, $4)',
                    [item.product_id, item.quantity, 'sale', `${order_type || 'Offline Order'} #${invoiceId}`]
                );
            }

            await client.query('COMMIT');
            res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
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

// Get Invoice History with Filters
router.get('/', authenticateToken, async (req, res) => {
    const { date, week, month, year } = req.query;
    let query = 'SELECT i.*, c.name as customer_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id';
    let values = [];
    let conditions = [];

    if (date) {
        conditions.push("i.created_at::date = $" + (values.length + 1));
        values.push(date);
    } else if (week) {
        // week format: '2023-W12' or logic for current year
        conditions.push("TO_CHAR(i.created_at, 'YYYY-IYY-IW') = $" + (values.length + 1));
        values.push(week);
    } else if (month) {
        // month format: '2023-05'
        conditions.push("TO_CHAR(i.created_at, 'YYYY-MM') = $" + (values.length + 1));
        values.push(month);
    } else if (year) {
        conditions.push("TO_CHAR(i.created_at, 'YYYY') = $" + (values.length + 1));
        values.push(year);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY i.created_at DESC';

    try {
        const result = await db.query(query, values);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Specific Invoice Details
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const invoice = await db.query(
            'SELECT i.*, c.name as customer_name, c.phone as customer_phone, c.address as customer_address FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id WHERE i.id = $1',
            [id]
        );
        const items = await db.query(
            'SELECT ii.*, p.name as product_name FROM invoice_items ii LEFT JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id = $1',
            [id]
        );
        res.json({ invoice: invoice.rows[0], items: items.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
