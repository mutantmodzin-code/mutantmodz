const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'invoice_items'")
    .then(res => { 
        console.log(JSON.stringify(res.rows, null, 2)); 
        process.exit(0); 
    })
    .catch(e => { 
        console.error(e); 
        process.exit(1); 
    });
