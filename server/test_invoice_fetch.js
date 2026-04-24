const db = require('./db/index');

async function testFetch() {
    try {
        const id = 17; // The invoice ID from the screenshot
        const itemsResult = await db.query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);
        console.log('Invoice Items for ID 17:', JSON.stringify(itemsResult.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

testFetch();
