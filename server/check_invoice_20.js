const db = require('./db/index');

async function check() {
    try {
        const res = await db.query('SELECT discount_percent FROM invoice_items WHERE invoice_id = 20');
        console.log('Invoice #20 discount_percent:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
