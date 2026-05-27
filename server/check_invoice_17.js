const db = require('./db/index');

async function check() {
    try {
        const res = await db.query(`
            SELECT ii.*, p.name 
            FROM invoice_items ii 
            JOIN products p ON ii.product_id = p.id 
            WHERE ii.invoice_id = 17
        `);
        console.log('Invoice #17 items:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
