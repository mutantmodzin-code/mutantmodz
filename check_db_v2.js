
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Uj5Xcte4uIiV@ep-small-mode-adaizi3d-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function check() {
  try {
    const res = await pool.query('SELECT * FROM categories');
    console.log('--- Categories ---');
    console.table(res.rows);
    
    // Check if sub_category column exists in products
    const res2 = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'products\'');
    console.log('--- Product Columns ---');
    console.table(res2.rows.map(r => r.column_name));
    
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
