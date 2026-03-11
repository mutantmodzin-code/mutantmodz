const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres:dinesh@127.0.0.1:5432/authdb?schema=public'
});

async function testInsert() {
    try {
        const res = await pool.query(
            'INSERT INTO products (name, category_id, brand, price, stock, vendor_id, sku, purchase_price, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            ['Test Product', 1, 'BrandX', 100.00, 10, 1, 'TEST-SKU-999', 80.00, 'test_url']
        );
        console.log('Insert Success:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error('Insert Error Detail:', err);
        process.exit(1);
    }
}
testInsert();
