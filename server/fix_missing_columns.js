const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding is_garage_sale column...');
    await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_garage_sale BOOLEAN DEFAULT FALSE;');
    console.log('Successfully added is_garage_sale column.');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
