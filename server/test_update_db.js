const db = require('./db');

const testUpdate = async () => {
    try {
        const id = 6;
        const sizeStock = { M: 2, L: 10, XL: 1 };
        const sizeStockStr = JSON.stringify(sizeStock);
        
        console.log('Testing DB update for ID 6 with:', sizeStockStr);
        
        const result = await db.query(
            'UPDATE products SET size_stock=$1::jsonb WHERE id=$2 RETURNING *',
            [sizeStockStr, id]
        );
        
        console.log('Update success! DB returned size_stock:', result.rows[0].size_stock);
        console.log('Type of returned size_stock:', typeof result.rows[0].size_stock);
        
        const res2 = await db.query('SELECT size_stock FROM products WHERE id = $1', [id]);
        console.log('SELECT result:', res2.rows[0].size_stock);
        
        process.exit(0);
    } catch (e) {
        console.error('Test failed:', e);
        process.exit(1);
    }
};

testUpdate();
