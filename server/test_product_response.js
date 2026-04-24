const db = require('./db/index');

async function test() {
    try {
        const res = await db.query('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id');
        console.log('Sample product:', JSON.stringify(res.rows[0], null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

test();
