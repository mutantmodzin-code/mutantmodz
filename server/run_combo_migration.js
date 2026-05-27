const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding is_combo column...');
    await client.query('ALTER TABLE products ADD COLUMN is_combo BOOLEAN DEFAULT FALSE;');
    console.log('Successfully added is_combo column.');
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column is_combo already exists.');
    } else {
      console.error('Error during migration:', err);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
