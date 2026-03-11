const { Pool } = require('pg');
require('dotenv').config({ path: 'd:/mutantmodz/server/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('Running migration...');
        await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'Offline Order'");
        await pool.query("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stock_deducted_status BOOLEAN DEFAULT TRUE");
        await pool.query("CREATE INDEX IF NOT EXISTS idx_invoices_order_type ON invoices(order_type)");
        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
