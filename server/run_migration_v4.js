const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('🚀 Starting Migration V4: Shipment & Delivery tracking...');
        
        await client.query(`
            ALTER TABLE invoices 
            ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS expected_delivery DATE;
        `);

        console.log('✅ Migration V4 completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
