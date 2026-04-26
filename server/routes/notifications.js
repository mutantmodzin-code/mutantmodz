const express = require('express');
const router = express.Router();
const db = require('../db');

// In-memory store for SSE clients
const clients = new Set();

// SSE endpoint - admin clients connect here
router.get('/stream', (req, res) => {
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
    });

    // Send initial connection message
    res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Notification stream connected' })}\n\n`);

    // Keep connection alive with heartbeat
    const heartbeat = setInterval(() => {
        res.write(`:heartbeat\n\n`);
    }, 30000);

    clients.add(res);

    req.on('close', () => {
        clients.delete(res);
        clearInterval(heartbeat);
    });
});

// Get latest online order (supports ?afterId=X to only return newer orders)
router.get('/latest', async (req, res) => {
    try {
        const { afterId } = req.query;
        let query = `
            SELECT i.id, i.total_amount, i.payment_method, i.created_at, c.name as customer_name
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.order_type = 'Online Order'
        `;
        const values = [];
        const parsedAfterId = parseInt(afterId);
        if (afterId && !isNaN(parsedAfterId)) {
            query += ` AND i.id > $1`;
            values.push(parsedAfterId);
        }
        query += ` ORDER BY i.id DESC LIMIT 1`;
        const result = await db.query(query, values);
        res.json(result.rows[0] || null);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get recent online orders (last 5) for admin portal initial load
router.get('/recent', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT i.id, i.total_amount, i.payment_method, i.created_at, c.name as customer_name
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.order_type = 'Online Order'
            ORDER BY i.id DESC
            LIMIT 5
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Broadcast notification to all connected admin clients
const broadcastNotification = (notification) => {
    // Note: SSE (broadcastNotification) does not work consistently across Vercel serverless instances.
    // This is maintained for local development, but polling is used for production.
    const data = `data: ${JSON.stringify(notification)}\n\n`;
    clients.forEach(client => {
        try {
            client.write(data);
        } catch (e) {
            clients.delete(client);
        }
    });
};

module.exports = router;
module.exports.broadcastNotification = broadcastNotification;
