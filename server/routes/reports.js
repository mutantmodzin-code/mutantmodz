const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// Dashboard statistics
// Dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const totalProducts = await db.query('SELECT COUNT(*) FROM products');
        // Threshold changed to 10 as per request
        const lowStockAlerts = await db.query('SELECT COUNT(*) FROM products WHERE stock < 10');
        const dailySales = await db.query('SELECT COALESCE(SUM(total_amount), 0) as sum FROM invoices WHERE created_at::date = CURRENT_DATE');
        const dailyInvoiceCount = await db.query('SELECT COUNT(*) FROM invoices WHERE created_at::date = CURRENT_DATE');

        // Recent Online Orders
        const recentOnline = await db.query("SELECT i.*, c.name as customer_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id WHERE order_type = 'Online Order' ORDER BY i.created_at DESC LIMIT 5");

        // Recent Offline Bills
        const recentOffline = await db.query("SELECT i.*, c.name as customer_name FROM invoices i LEFT JOIN customers c ON i.customer_id = c.id WHERE order_type = 'Offline Order' ORDER BY i.created_at DESC LIMIT 5");

        // Remaining inventory count (total items across all products)
        const totalStock = await db.query('SELECT COALESCE(SUM(stock), 0) as total FROM products');

        // Revenue trend (last 7 days)
        const revenueTrend = await db.query(
            "SELECT TO_CHAR(created_at, 'YYYY-MM-DD') as date, SUM(total_amount) as revenue FROM invoices WHERE created_at >= CURRENT_DATE - INTERVAL '7 days' GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD') ORDER BY date"
        );

        res.json({
            totalProducts: parseInt(totalProducts.rows[0].count),
            lowStockCount: parseInt(lowStockAlerts.rows[0].count),
            dailyRevenue: parseFloat(dailySales.rows[0].sum),
            dailyInvoiceCount: parseInt(dailyInvoiceCount.rows[0].count),
            totalStock: parseInt(totalStock.rows[0].total),
            recentOnline: recentOnline.rows,
            recentOffline: recentOffline.rows,
            revenueTrend: revenueTrend.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Low stock products
router.get('/low-stock', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE stock < 10 ORDER BY stock ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Top selling products
router.get('/top-selling', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT p.name, SUM(ii.quantity) as total_sold FROM invoice_items ii JOIN products p ON ii.product_id = p.id GROUP BY p.name ORDER BY total_sold DESC LIMIT 5'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Monthly revenue report
router.get('/monthly-revenue', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT TO_CHAR(created_at, 'YYYY-MM') as month, SUM(total_amount) as revenue FROM invoices WHERE created_at >= CURRENT_DATE - INTERVAL '12 months' GROUP BY TO_CHAR(created_at, 'YYYY-MM') ORDER BY month DESC"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Weekly revenue report
router.get('/weekly-revenue', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT TO_CHAR(created_at, 'IYYY-IW') as week, SUM(total_amount) as revenue FROM invoices WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks' GROUP BY TO_CHAR(created_at, 'IYYY-IW') ORDER BY week DESC"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Yearly revenue report
router.get('/yearly-revenue', authenticateToken, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT TO_CHAR(created_at, 'YYYY') as year, SUM(total_amount) as revenue FROM invoices GROUP BY TO_CHAR(created_at, 'YYYY') ORDER BY year DESC"
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Profit Analytics
router.get('/profit', authenticateToken, async (req, res) => {
    try {
        // Daily Profit
        const dailyProfit = await db.query(`
            SELECT 
                TO_CHAR(i.created_at, 'YYYY-MM-DD') as date,
                SUM(ii.line_total) as total_selling,
                SUM(ii.quantity * ii.purchase_price) as total_purchase,
                SUM(ii.line_total - (ii.quantity * ii.purchase_price)) as profit
            FROM invoices i
            JOIN invoice_items ii ON i.id = ii.invoice_id
            WHERE i.created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY TO_CHAR(i.created_at, 'YYYY-MM-DD')
            ORDER BY date DESC
        `);

        // Weekly Profit
        const weeklyProfit = await db.query(`
            SELECT 
                TO_CHAR(i.created_at, 'IYYY-IW') as week,
                SUM(ii.line_total) as total_selling,
                SUM(ii.quantity * ii.purchase_price) as total_purchase,
                SUM(ii.line_total - (ii.quantity * ii.purchase_price)) as profit
            FROM invoices i
            JOIN invoice_items ii ON i.id = ii.invoice_id
            WHERE i.created_at >= CURRENT_DATE - INTERVAL '12 weeks'
            GROUP BY TO_CHAR(i.created_at, 'IYYY-IW')
            ORDER BY week DESC
        `);

        // Monthly Profit
        const monthlyProfit = await db.query(`
            SELECT 
                TO_CHAR(i.created_at, 'YYYY-MM') as month,
                SUM(ii.line_total) as total_selling,
                SUM(ii.quantity * ii.purchase_price) as total_purchase,
                SUM(ii.line_total - (ii.quantity * ii.purchase_price)) as profit
            FROM invoices i
            JOIN invoice_items ii ON i.id = ii.invoice_id
            WHERE i.created_at >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY TO_CHAR(i.created_at, 'YYYY-MM')
            ORDER BY month DESC
        `);

        // Profit per Product
        const productProfit = await db.query(`
            SELECT 
                p.name,
                p.sku,
                SUM(ii.quantity) as units_sold,
                SUM(ii.line_total) as total_revenue,
                SUM(ii.line_total - (ii.quantity * ii.purchase_price)) as total_profit
            FROM invoice_items ii
            JOIN products p ON ii.product_id = p.id
            GROUP BY p.name, p.sku
            ORDER BY total_profit DESC
            LIMIT 10
        `);

        res.json({
            daily: dailyProfit.rows,
            weekly: weeklyProfit.rows,
            monthly: monthlyProfit.rows,
            byProduct: productProfit.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PDF Report Data
router.get('/pdf-data', authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(i.id) as invoice_count,
                SUM(i.total_amount) as total_revenue,
                SUM(ii.quantity) as total_products_sold
            FROM invoices i
            JOIN invoice_items ii ON i.id = ii.invoice_id
            WHERE i.created_at::date BETWEEN $1 AND $2
        `, [startDate, endDate]);

        const items = await db.query(`
            SELECT 
                p.name,
                SUM(ii.quantity) as quantity,
                SUM(ii.line_total) as revenue
            FROM invoice_items ii
            JOIN products p ON ii.product_id = p.id
            JOIN invoices i ON ii.invoice_id = i.id
            WHERE i.created_at::date BETWEEN $1 AND $2
            GROUP BY p.name
            ORDER BY quantity DESC
        `, [startDate, endDate]);

        res.json({
            summary: stats.rows[0],
            details: items.rows,
            dateRange: { start: startDate, end: endDate }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
