const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function updateInvoiceSchema() {
  try {
    await pool.query('ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS garage_sale_id INTEGER REFERENCES garage_sale(id)');
    console.log('Invoice items table updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating invoice items table:', err);
    process.exit(1);
  }
}

updateInvoiceSchema();
