const db = require('./index');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const migrationFile = path.join(__dirname, '../migrations/auth_update.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');

    try {
        console.log('Running auth migration...');
        await db.query(sql);
        console.log('Auth migration applied successfully');
    } catch (error) {
        console.error('Error applying migration:', error);
    } finally {
        // Exit process
        process.exit();
    }
}

runMigration();