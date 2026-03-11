const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:dinesh@127.0.0.1:5432/authdb?schema=public'
});

async function run() {
    try {
        const res = await pool.query('SELECT * FROM products');
        console.log('Products:', JSON.stringify(res.rows, null, 2));
        const cats = await pool.query('SELECT * FROM categories');
        console.log('Categories:', JSON.stringify(cats.rows, null, 2));
        const vends = await pool.query('SELECT * FROM vendors');
        console.log('Vendors:', JSON.stringify(vends.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('DB CHECK ERROR:', err);
        process.exit(1);
    }
}
run();
