const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE TEST ORDER FOR CUSTOMER
router.post('/create-test-order/:customerId', async (req, res) => {
    const { customerId } = req.params;
    
    try {
        console.log('Creating test order for customer:', customerId);
        
        // Verify customer exists
        const customerCheck = await db.query(
            'SELECT id, name, email FROM customers WHERE id = $1',
            [customerId]
        );

        if (customerCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        const customer = customerCheck.rows[0];
        console.log('✅ Customer found:', customer.name);

        // Get first product for test
        const productCheck = await db.query(
            'SELECT id, name, price FROM products LIMIT 1'
        );

        if (productCheck.rows.length === 0) {
            return res.status(400).json({ error: 'No products available for test order' });
        }

        const product = productCheck.rows[0];
        const quantity = 2;
        const subtotal = parseFloat(product.price) * quantity;
        const tax = subtotal * 0.18; // 18% GST
        const total = subtotal + tax;

        // Create invoice
        const invoiceResult = await db.query(
            `INSERT INTO invoices (
                customer_id, subtotal, tax, discount, total_amount, 
                payment_method, order_type, status, cgst_amount, sgst_amount, total_gst
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
            [
                customerId,
                subtotal,
                tax,
                0,
                total,
                'Test Payment',
                'Online Order',
                'paid',
                tax / 2,
                tax / 2,
                tax
            ]
        );

        const invoiceId = invoiceResult.rows[0].id;
        console.log('✅ Invoice created:', invoiceId);

        // Create invoice item
        await db.query(
            `INSERT INTO invoice_items (
                invoice_id, product_id, quantity, unit_price, line_total
            ) VALUES ($1, $2, $3, $4, $5)`,
            [invoiceId, product.id, quantity, product.price, subtotal]
        );

        console.log('✅ Invoice item created');

        res.json({
            message: 'Test order created successfully',
            invoiceId,
            customer: customer.name,
            product: product.name,
            quantity,
            total: total.toFixed(2)
        });
    } catch (error) {
        console.error('TEST ORDER ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
