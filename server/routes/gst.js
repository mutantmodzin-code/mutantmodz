const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('./auth');

// GST Report Data (Summary + Table)
router.get('/report', authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        // Summary
        const summaryResult = await db.query(`
            SELECT 
                COUNT(*) as total_invoices,
                SUM(taxable_value) as total_taxable_sales,
                SUM(total_gst) as total_gst_collected,
                SUM(cgst_amount) as total_cgst,
                SUM(sgst_amount) as total_sgst,
                SUM(igst_amount) as total_igst
            FROM invoices
            WHERE created_at::date BETWEEN $1 AND $2
        `, [startDate, endDate]);

        // Table Data
        const tableResult = await db.query(`
            SELECT 
                i.id as invoice_number,
                i.created_at as invoice_date,
                c.name as customer_name,
                i.taxable_value,
                i.cgst_amount,
                i.sgst_amount,
                i.igst_amount,
                i.total_gst,
                i.total_amount
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.created_at::date BETWEEN $1 AND $2
            ORDER BY i.created_at DESC
        `, [startDate, endDate]);

        res.json({
            summary: summaryResult.rows[0],
            invoices: tableResult.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GST Analytics
router.get('/analytics', authenticateToken, async (req, res) => {
    try {
        // Monthly collection
        const monthlyResult = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM') as month,
                SUM(total_gst) as total_gst
            FROM invoices
            WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
            ORDER BY month ASC
        `);

        // GST per product category
        const categoryResult = await db.query(`
            SELECT 
                cat.name as category_name,
                SUM(ii.total_gst) as total_gst
            FROM invoice_items ii
            JOIN products p ON ii.product_id = p.id
            JOIN categories cat ON p.category_id = cat.id
            JOIN invoices i ON ii.invoice_id = i.id
            GROUP BY cat.name
            ORDER BY total_gst DESC
        `);

        // GST Trend (daily for last 30 days)
        const trendResult = await db.query(`
            SELECT 
                TO_CHAR(created_at, 'YYYY-MM-DD') as date,
                SUM(total_gst) as total_gst
            FROM invoices
            WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
            GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
            ORDER BY date ASC
        `);

        res.json({
            monthly: monthlyResult.rows,
            byCategory: categoryResult.rows,
            trend: trendResult.rows
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
