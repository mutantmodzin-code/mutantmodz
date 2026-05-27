const db = require('./index');

async function migrate() {
    try {
        console.log('--- Running Customer Origin Migration ---');
        
        // Add origin column
        await db.query(`
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS origin VARCHAR(20) DEFAULT 'store'
        `);
        console.log('✅ Added origin column to customers');

        // Retroactively set origin to 'website' for any customer who has an email 
        // OR has a non-null is_verified or password_hash
        await db.query(`
            UPDATE customers 
            SET origin = 'website' 
            WHERE email IS NOT NULL 
               OR password_hash IS NOT NULL 
               OR is_verified = true
        `);
        console.log('✅ Retroactively tagged existing website users');

        console.log('--- Migration Success ---');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration Failed:', err);
        process.exit(1);
    }
}

migrate();
