const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function checkAll() {
  const client = await pool.connect();
  try {
    console.log('Checking all products...');
    const res = await client.query('SELECT id, name, is_garage_sale, is_combo, combo_type FROM products ORDER BY id DESC LIMIT 5;');
    console.log('Last 5 products added:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkAll();
