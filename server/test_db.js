const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function test() {
    try {
        const res = await pool.query("SELECT * FROM categories");
        console.log('Categories in DB:', res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error fetching categories:', err);
        process.exit(1);
    }
}
test();
