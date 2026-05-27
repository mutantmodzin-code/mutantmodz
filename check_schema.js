import db from './server/db.js';

async function checkSchema() {
  try {
    const { rows } = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'reels'
    `);
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('Error checking schema:', err);
  } finally {
    process.exit();
  }
}

checkSchema();
