const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log('Starting migration: Adding SKU column to combos and garage_sale tables...');
    
    await pool.query(`
      ALTER TABLE combos 
      ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;
    `);

    await pool.query(`
      ALTER TABLE garage_sale 
      ADD COLUMN IF NOT EXISTS sku VARCHAR(100) UNIQUE;
    `);
    
    console.log('✅ Success: SKU columns added successfully.');
  } catch (err) {
    console.error('❌ Error during migration:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
