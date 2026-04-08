const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function checkSchema() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products'");
    console.log('Columns in products table:');
    res.rows.forEach(r => console.log('- ' + r.column_name));
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

checkSchema();
