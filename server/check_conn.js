const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/mutantmodz/server/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function run() {
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables found:', res.rows.map(r => r.table_name).join(', '));

        const prodCount = await pool.query('SELECT COUNT(*) FROM products');
        console.log('Product count:', prodCount.rows[0].count);

        const catCount = await pool.query('SELECT COUNT(*) FROM categories');
        console.log('Category count:', catCount.rows[0].count);

        const vendorCount = await pool.query('SELECT COUNT(*) FROM vendors');
        console.log('Vendor count:', vendorCount.rows[0].count);

        process.exit(0);
    } catch (err) {
        console.error('DB CONNECTION ERROR:', err.message);
        process.exit(1);
    }
}
run();
