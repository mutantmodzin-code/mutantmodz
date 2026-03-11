const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/mutantmodz/server/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function check() {
    try {
        const products = await pool.query('SELECT sku, name FROM products');
        console.log('Current Products:', products.rows);
        const vendors = await pool.query('SELECT id, name FROM vendors');
        console.log('Current Vendors:', vendors.rows);
        const categories = await pool.query('SELECT id, name FROM categories');
        console.log('Current Categories:', categories.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
