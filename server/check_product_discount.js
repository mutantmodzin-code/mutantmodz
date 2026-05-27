const db = require('./db/index');

async function check() {
    try {
        const res = await db.query("SELECT id, name, discount_percent FROM products WHERE name ILIKE '%66BHP BALACLAVA%'");
        console.log('Product details:', JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
