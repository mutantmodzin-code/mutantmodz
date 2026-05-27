const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Starting migration: Adding delivery columns to products table...');
    
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS delivery_tn NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS delivery_south NUMERIC(10, 2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS delivery_north NUMERIC(10, 2) DEFAULT 0
    `);
    
    console.log('✅ Success: Delivery columns added successfully.');
  } catch (err) {
    console.error('❌ Error during migration:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
