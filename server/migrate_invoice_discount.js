const db = require('./db/index');

async function migrate() {
    try {
        console.log('Checking invoice_items schema...');
        const res = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'invoice_items' AND column_name = 'discount_percent'
        `);

        if (res.rows.length === 0) {
            console.log('Adding discount_percent column to invoice_items...');
            await db.query('ALTER TABLE invoice_items ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0');
            console.log('Column added successfully.');
        } else {
            console.log('discount_percent column already exists.');
        }

        // Also check if discount_percent is in products table (it should be, but let's be sure)
        const prodRes = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'products' AND column_name = 'discount_percent'
        `);
        if (prodRes.rows.length === 0) {
             console.log('Adding discount_percent column to products...');
             await db.query('ALTER TABLE products ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0');
        }

        // Check combos table
        const comboRes = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'combos' AND column_name = 'discount_percent'
        `);
        if (comboRes.rows.length === 0) {
            console.log('Adding discount_percent column to combos...');
            await db.query('ALTER TABLE combos ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0');
        }

        // Check garage_sale table
        const gsRes = await db.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'garage_sale' AND column_name = 'discount_percent'
        `);
        if (gsRes.rows.length === 0) {
            console.log('Adding discount_percent column to garage_sale...');
            await db.query('ALTER TABLE garage_sale ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0');
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
