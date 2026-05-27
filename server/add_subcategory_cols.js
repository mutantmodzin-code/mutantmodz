
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Uj5Xcte4uIiV@ep-small-mode-adaizi3d-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function migrate() {
  try {
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category_type VARCHAR(100)');
    await pool.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS sub_category VARCHAR(100)');
    console.log('✅ Migration successful: sub_category_type and sub_category columns added.');
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();
