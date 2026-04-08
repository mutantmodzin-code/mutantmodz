const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function run() {
  try {
    const r = await pool.query('SELECT count(*) FROM products');
    console.log('Total Products in DB:', r.rows[0].count);
    
    const r2 = await pool.query('SELECT count(*) FROM products WHERE is_garage_sale = true');
    console.log('Garage Sale Products:', r2.rows[0].count);

    const r3 = await pool.query('SELECT count(*) FROM products WHERE is_combo = true');
    console.log('Combo Products:', r3.rows[0].count);
    
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
