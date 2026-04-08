const { Pool } = require('pg');
require('dotenv').config({ path: './server/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding combo_type column...');
    await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS combo_type VARCHAR(255);');
    console.log('Successfully added combo_type column.');
  } catch (err) {
    console.error('Error during migration:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
