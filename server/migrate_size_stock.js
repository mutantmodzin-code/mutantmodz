const db = require('./db');

async function migrate() {
    try {
        await db.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS size_stock JSONB DEFAULT '{}'");
        console.log('Migration OK: size_stock column added to products table');
        process.exit(0);
    } catch (e) {
        console.error('Migration failed:', e.message);
        process.exit(1);
    }
}

migrate();
