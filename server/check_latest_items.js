const db = require('./db/index');

async function check() {
    try {
        const res = await db.query(`
            SELECT ii.*, p.name 
            FROM invoice_items ii 
            JOIN products p ON ii.product_id = p.id 
            ORDER BY ii.id DESC 
            LIMIT 5
        `);
        console.log('Latest invoice items:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
