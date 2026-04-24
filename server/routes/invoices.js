const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');
const { broadcastNotification } = require('./notifications');

// Create Invoice
router.post('/', async (req, res) => {
    const {
        customer_id, items, subtotal, tax, discount, total_amount, payment_method, order_type,
        gst_percentage, cgst_amount, sgst_amount, igst_amount, taxable_value, total_gst,
        shipping_address, delivery_charge: clientDeliveryCharge
    } = req.body;

    try {
        // Server-side delivery charge verification (prevent tampering)
        // Fallback: if clientDeliveryCharge is missing OR 0 but total implies it exists, derive it
        let verifiedDeliveryCharge = Number(clientDeliveryCharge) || 0;
        if (verifiedDeliveryCharge === 0) {
            // Backup logic: difference between total and subtotal (if no taxes/discounts)
            const calculated = Number(total_amount) - Number(subtotal) - Number(tax || 0);
            if (!isNaN(calculated) && calculated > 0) {
                verifiedDeliveryCharge = calculated;
            }
        }
        
        // Ensure it is a valid number and cap it
        if (isNaN(verifiedDeliveryCharge)) verifiedDeliveryCharge = 0;
        verifiedDeliveryCharge = Math.min(verifiedDeliveryCharge, 300);

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Safety Check: Verify all products/combos have enough stock
            for (const item of items) {
                if (item.product_id) {
                    const prodRes = await client.query('SELECT stock, name FROM products WHERE id = $1', [item.product_id]);
                    const currentStock = prodRes.rows[0]?.stock || 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Insufficient stock for ${prodRes.rows[0]?.name || 'Product'}. Available: ${currentStock}, Requested: ${item.quantity}`);
                    }
                } else if (item.combo_id) {
                    // Check component stock for combos
                    const comboRes = await client.query('SELECT name, linked_items FROM combos WHERE id = $1', [item.combo_id]);
                    const combo = comboRes.rows[0];
                    if (combo && Array.isArray(combo.linked_items)) {
                        for (const linked of combo.linked_items) {
                            const prodRes = await client.query('SELECT stock, name FROM products WHERE sku = $1', [linked.sku]);
                            const prod = prodRes.rows[0];
                            const available = prod?.stock || 0;
                            const totalReq = linked.quantity * item.quantity;
                            if (available < totalReq) {
                                throw new Error(`Insufficient component stock for combo "${combo.name}". ${prod?.name || linked.sku} needs ${totalReq} units, but only ${available} available.`);
                            }
                        }
                    }
                } else if (item.garage_sale_id) {
                    const res = await client.query('SELECT name, linked_items FROM garage_sale WHERE id = $1', [item.garage_sale_id]);
                    const gsItem = res.rows[0];
                    if (gsItem && gsItem.linked_items && Array.isArray(gsItem.linked_items)) {
                        for (const linked of gsItem.linked_items) {
                            const totalReq = (linked.quantity || 1) * item.quantity;
                            const prodRes = await client.query('SELECT id, name, stock FROM products WHERE sku = $1', [linked.sku]);
                            const prod = prodRes.rows[0];
                            const available = prod ? prod.stock : 0;
                            if (available < totalReq) {
                                throw new Error(`Insufficient inventory for garage sale item "${gsItem.name}". ${prod?.name || linked.sku} needs ${totalReq} units, but only ${available} available.`);
                            }
                        }
                    }
                }
            }

            // 1.5 Update Customer Address if it's an online order
            if (order_type === 'Online Order' && shipping_address && customer_id) {
                await client.query(
                    'UPDATE customers SET address = $1 WHERE id = $2',
                    [shipping_address, customer_id]
                );
            }

            // 2. Insert Invoice
            const invoiceResult = await client.query(
                `INSERT INTO invoices (
                    customer_id, subtotal, tax, discount, total_amount, payment_method, order_type,
                    gst_percentage, cgst_amount, sgst_amount, igst_amount, taxable_value, total_gst, status, delivery_charge
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id`,
                [
                    customer_id, subtotal, tax, discount, total_amount, payment_method, order_type || 'Offline Order',
                    gst_percentage || 0, cgst_amount || 0, sgst_amount || 0, igst_amount || 0,
                    taxable_value || subtotal, total_gst || tax,
                    (payment_method && payment_method.toUpperCase() === 'COD') ? 'unpaid' : 'paid',
                    verifiedDeliveryCharge
                ]
            );
            const invoiceId = invoiceResult.rows[0].id;

            for (const item of items) {
                let purchase_price = item.purchase_price;
                if (purchase_price === undefined && item.product_id) {
                    const prodRes = await client.query('SELECT purchase_price FROM products WHERE id = $1', [item.product_id]);
                    purchase_price = prodRes.rows[0]?.purchase_price || 0;
                }

                await client.query(
                    `INSERT INTO invoice_items (
                        invoice_id, product_id, combo_id, garage_sale_id, quantity, unit_price, line_total, purchase_price,
                        gst_percentage, cgst_amount, sgst_amount, igst_amount, taxable_amount,
                        selected_size, selected_color, discount_percent
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                    [
                        invoiceId, item.product_id || null, item.combo_id || null, item.garage_sale_id || null, item.quantity, item.unit_price, item.line_total, purchase_price || 0,
                        item.gst_percentage || 0, item.cgst_amount || 0, item.sgst_amount || 0,
                        item.igst_amount || 0, item.taxable_amount || item.line_total,
                        item.selected_size || null, item.selected_color || null,
                        item.discount_percent || 0
                    ]
                );

                // 3. Deduct Stock
                if (item.product_id) {
                    // Standard product deduction
                    await client.query(
                        'UPDATE products SET stock = stock - $1 WHERE id = $2',
                        [item.quantity, item.product_id]
                    );
                    
                    await client.query(
                        'INSERT INTO inventory (product_id, change_amount, type, reason) VALUES ($1, $2, $3, $4)',
                        [item.product_id, item.quantity, 'sale', `${order_type || 'Offline Order'} #${invoiceId}`]
                    );
                } else if (item.combo_id) {
                    // Combo bundle deduction: Reduce component items stock
                    const comboRes = await client.query('SELECT linked_items FROM combos WHERE id = $1', [item.combo_id]);
                    const linkedItems = comboRes.rows[0]?.linked_items || [];
                    
                    if (Array.isArray(linkedItems)) {
                        for (const linked of linkedItems) {
                            const qtyToReduce = (linked.quantity || 1) * item.quantity;
                            
                            // Deduct from products by SKU
                            const updateRes = await client.query(
                                'UPDATE products SET stock = stock - $1 WHERE sku = $2 RETURNING id',
                                [qtyToReduce, linked.sku]
                            );
                            
                            // Log inventory for each component if product was found
                            if (updateRes.rows.length > 0) {
                                await client.query(
                                    'INSERT INTO inventory (product_id, change_amount, type, reason) VALUES ($1, $2, $3, $4)',
                                    [updateRes.rows[0].id, qtyToReduce, 'sale', `Combo Order #${invoiceId} (Bundle: ${item.combo_id})`]
                                );
                            }
                        }
                    }
                    
                    await client.query(
                        'UPDATE combos SET stock = stock - $1 WHERE id = $2',
                        [item.quantity, item.combo_id]
                    );
                } else if (item.garage_sale_id) {
                    const gsRes = await client.query('SELECT linked_items FROM garage_sale WHERE id = $1', [item.garage_sale_id]);
                    const linkedItems = gsRes.rows[0]?.linked_items || [];
                    
                    if (Array.isArray(linkedItems)) {
                        for (const linked of linkedItems) {
                            const qtyToReduce = (linked.quantity || 1) * item.quantity;
                            const updateRes = await client.query(
                                'UPDATE products SET stock = stock - $1 WHERE sku = $2 RETURNING id',
                                [qtyToReduce, linked.sku]
                            );
                            if (updateRes.rows.length > 0) {
                                await client.query(
                                    'INSERT INTO inventory (product_id, change_amount, type, reason) VALUES ($1, $2, $3, $4)',
                                    [updateRes.rows[0].id, qtyToReduce, 'sale', `Garage Sale Order #${invoiceId} (Item: ${item.garage_sale_id})`]
                                );
                            }
                        }
                    }
                    await client.query(
                        'UPDATE garage_sale SET stock = stock - $1 WHERE id = $2',
                        [item.quantity, item.garage_sale_id]
                    );
                }
            }

            await client.query('COMMIT');

            // Broadcast notification to admin panel if it's an online order
            if (order_type === 'Online Order') {
                // Fetch customer name for the notification
                let customerName = 'Customer';
                try {
                    const custRes = await db.query('SELECT name FROM customers WHERE id = $1', [customer_id]);
                    customerName = custRes.rows[0]?.name || 'Customer';
                } catch (e) { /* ignore */ }

                broadcastNotification({
                    type: 'new_order',
                    orderId: invoiceId,
                    customerName,
                    totalAmount: total_amount,
                    paymentMethod: payment_method || 'Online',
                    itemCount: items.length,
                    timestamp: new Date().toISOString()
                });
            }

            res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (error) {
        if (error.message.includes('invoices_customer_id_fkey')) {
            return res.status(400).json({ error: 'Session expired or invalid user profile. Please completely log out, clear your cache, and log back in.' });
        }
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

// Get Online Orders with Items
router.get('/online/all', authenticateToken, async (req, res) => {
    try {
        const { date } = req.query;
        let query = `
            SELECT i.*, 
                   c.name as customer_name, c.email as customer_email, 
                   c.phone as customer_phone, c.address as customer_address
            FROM invoices i     
            LEFT JOIN customers c ON i.customer_id = c.id 
            WHERE i.order_type = 'Online Order'
        `;
        let values = [];
        
        if (date) {
            query += ` AND i.created_at::date = $1`;
            values.push(date);
        }
        
        query += ` ORDER BY i.created_at DESC`;

        const result = await db.query(query, values);
        
        let onlineOrders = result.rows;
        if (onlineOrders.length > 0) {
            const invoiceIds = onlineOrders.map(order => order.id);
            const itemsQuery = `
                SELECT ii.*, 
                       COALESCE(p.name, c.name, gs.name) as product_name, 
                       COALESCE(p.image_url, c.image_url, gs.image_url) as image_url,
                       ii.unit_price as price
                FROM invoice_items ii 
                LEFT JOIN products p ON ii.product_id = p.id 
                LEFT JOIN combos c ON ii.combo_id = c.id
                LEFT JOIN garage_sale gs ON ii.garage_sale_id = gs.id
                WHERE ii.invoice_id = ANY($1)
            `;
            const itemsResult = await db.query(itemsQuery, [invoiceIds]);
            
            const itemsByInvoice = {};
            itemsResult.rows.forEach(item => {
                if (!itemsByInvoice[item.invoice_id]) {
                    itemsByInvoice[item.invoice_id] = [];
                }
                itemsByInvoice[item.invoice_id].push(item);
            });
            
            onlineOrders.forEach(order => {
                order.items = itemsByInvoice[order.id] || [];
            });
        }

        res.json(onlineOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Customer Orders (specific to logged-in user) - MUST BE BEFORE /:id
router.get('/customer/:customerId', authenticateToken, async (req, res) => {
    const { customerId } = req.params;
    console.log('📦 Fetching orders for customer:', customerId);
    
    try {
        const invoices = await db.query(
            `SELECT i.* FROM invoices i 
             WHERE i.customer_id = $1 
             ORDER BY i.created_at DESC`,
            [customerId]
        );

        console.log(`Found ${invoices.rows.length} invoices for customer ${customerId}`);

        if (invoices.rows.length === 0) {
            return res.json([]);
        }

        const invoiceIds = invoices.rows.map(inv => inv.id);
        const items = await db.query(
            `SELECT ii.*, 
                    COALESCE(p.name, c.name, gs.name) as product_name, 
                    COALESCE(p.image_url, c.image_url, gs.image_url) as image_url,
                    ii.unit_price as price
             FROM invoice_items ii 
             LEFT JOIN products p ON ii.product_id = p.id 
             LEFT JOIN combos c ON ii.combo_id = c.id
             LEFT JOIN garage_sale gs ON ii.garage_sale_id = gs.id
             WHERE ii.invoice_id = ANY($1)`,
            [invoiceIds]
        );

        const itemsByInvoice = {};
        items.rows.forEach(item => {
            if (!itemsByInvoice[item.invoice_id]) {
                itemsByInvoice[item.invoice_id] = [];
            }
            itemsByInvoice[item.invoice_id].push(item);
        });

        const ordersWithItems = invoices.rows.map(invoice => ({
            ...invoice,
            items: itemsByInvoice[invoice.id] || []
        }));

        res.json(ordersWithItems);
    } catch (error) {
        console.error('GET CUSTOMER ORDERS ERROR:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update Invoice Status with Shipment Tracking
router.patch('/:id/status', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, expected_delivery } = req.body;
    try {
        let query = 'UPDATE invoices SET status = $1';
        let params = [status, id];
        
        // If status improved to Shipped/Completed, set shipped timestamp
        if (status === 'Shipped' || status === 'Completed') {
            query += ', shipped_at = CURRENT_TIMESTAMP';
        }
        
        if (expected_delivery) {
            query += ', expected_delivery = $' + (params.length + 1);
            params.push(expected_delivery);
        }
        
        query += ' WHERE id = $2';
        
        await db.query(query, params);
        res.json({ message: 'Order status and delivery schedule updated' });
    } catch (error) {
        console.error('STATUS UPDATE ERROR:', error);
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
            `SELECT ii.*, 
                    COALESCE(p.name, c.name, gs.name) as product_name, 
                    COALESCE(p.image_url, c.image_url, gs.image_url) as image_url,
                    ii.unit_price as price
             FROM invoice_items ii 
             LEFT JOIN products p ON ii.product_id = p.id 
             LEFT JOIN combos c ON ii.combo_id = c.id
             LEFT JOIN garage_sale gs ON ii.garage_sale_id = gs.id
             WHERE ii.invoice_id = $1`,
            [id]
        );
        res.json({ invoice: invoice.rows[0], items: items.rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
