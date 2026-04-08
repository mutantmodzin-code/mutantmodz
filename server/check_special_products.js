const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function checkData() {
  const client = await pool.connect();
  try {
    console.log('Checking for Garage Sale products...');
    const res = await client.query('SELECT id, name, is_garage_sale, is_combo, combo_type FROM products WHERE is_garage_sale = true OR is_combo = true;');
    console.log(`Found ${res.rows.length} products with special flags:`);
    console.table(res.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkData();
