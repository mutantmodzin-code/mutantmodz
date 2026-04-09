const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  try {
    console.log('--- Migrating: Linking Combos to Inventory ---');

    // 1. Add linked_items to combos table
    await pool.query(`
      ALTER TABLE combos 
      ADD COLUMN IF NOT EXISTS linked_items JSONB DEFAULT '[]'
    `);
    console.log('✅ Column linked_items added to combos table');

    // 2. Add combo_id to invoice_items table
    await pool.query(`
      ALTER TABLE invoice_items 
      ADD COLUMN IF NOT EXISTS combo_id INT REFERENCES combos(id) ON DELETE SET NULL
    `);
    console.log('✅ Column combo_id added to invoice_items table');

    // 3. Optional: Make product_id nullable since an item can be a combo instead
    await pool.query(`
      ALTER TABLE invoice_items 
      ALTER COLUMN product_id DROP NOT NULL
    `);
    console.log('✅ Column product_id made nullable in invoice_items');

    console.log('--- Migration Success ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failure:', err);
    process.exit(1);
  }
}

migrate();
