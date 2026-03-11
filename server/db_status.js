const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:dinesh@127.0.0.1:5432/authdb?schema=public'
});

async function run() {
    try {
        const vendors = await pool.query('SELECT * FROM vendors');
        console.log('--- Vendors ---');
        console.table(vendors.rows);

        const categories = await pool.query('SELECT * FROM categories');
        console.log('--- Categories ---');
        console.table(categories.rows);

        const products = await pool.query('SELECT * FROM products');
        console.log('--- Products ---');
        console.table(products.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
