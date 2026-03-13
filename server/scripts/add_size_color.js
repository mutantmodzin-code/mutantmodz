const db = require('../db');

async function migrate() {
    try {
        await db.query(`
            ALTER TABLE invoice_items
            ADD COLUMN IF NOT EXISTS selected_size VARCHAR(20),
            ADD COLUMN IF NOT EXISTS selected_color VARCHAR(50)
        `);
        console.log('Migration complete: selected_size and selected_color added to invoice_items');
    } catch (e) {
        console.error('Migration failed:', e.message);
    } finally {
        process.exit(0);
    }
}

migrate();
