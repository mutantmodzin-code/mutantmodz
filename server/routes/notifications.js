const express = require('express');
const router = express.Router();

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

// Function to broadcast to all connected admin clients
const broadcastNotification = (notification) => {
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
