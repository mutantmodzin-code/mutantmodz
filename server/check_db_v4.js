
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Uj5Xcte4uIiV@ep-small-mode-adaizi3d-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function check() {
  try {
    const res = await pool.query('SELECT * FROM categories');
    console.log('CATEGORIES_JSON:' + JSON.stringify(res.rows));
    
    const res2 = await pool.query('SELECT column_name FROM information_schema.columns WHERE table_name = \'products\'');
    console.log('COLUMNS_JSON:' + JSON.stringify(res2.rows.map(r => r.column_name)));
    
    await pool.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
