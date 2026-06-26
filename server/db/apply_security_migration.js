const db = require('./index');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const migrationFile = path.join(__dirname, '../migrations/01_security_upgrade.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    try {
        console.log('Running enterprise security schema migrations...');
        await db.query(sql);
        console.log('✓ Enterprise security schemas applied successfully');
    } catch (error) {
        console.error('❌ Error applying security migrations:', error);
    } finally {
        // Exit process
        process.exit();
    }
}

runMigration();
