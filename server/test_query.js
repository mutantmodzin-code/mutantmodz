const db = require('./db');
async function test() {
    try {
        const query = `
            SELECT i.id, i.total_amount, i.payment_method, i.created_at, c.name as customer_name
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            WHERE i.order_type = 'Online Order' AND i.id > $1
            ORDER BY i.id DESC LIMIT 1
        `;
        const res = await db.query(query, [5]);
        console.log(res.rows);
    } catch(e) {
        console.error("DB Error:", e.message);
    }
    process.exit(0);
}
test();
