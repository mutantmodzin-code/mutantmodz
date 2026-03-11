const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    try {
        console.log('Verifying inventory table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS inventory (
                id SERIAL PRIMARY KEY,
                product_id INTEGER REFERENCES products(id),
                type VARCHAR(20), -- 'sale', 'purchase', 'adjustment', 'return'
                change_amount INTEGER,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
