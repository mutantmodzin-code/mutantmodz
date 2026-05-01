const db = require('./db');

async function testUpdate() {
    try {
        console.log("Fetching a helmet product to update...");
        const res = await db.query("SELECT id, name, size_stock, stock, category_id, sku FROM products WHERE category_id = 1 LIMIT 1");
        const product = res.rows[0];
        console.log("Original Product:", product);

        if (!product) {
            console.log("No helmet found");
            process.exit(0);
        }

        const newSizeStock = { M: 5, L: 10, XL: 2 };
        const totalStock = 17;

        console.log(`Updating product ${product.id} with sizes:`, newSizeStock);
        
        const updateRes = await db.query(
            'UPDATE products SET size_stock = $1, stock = $2 WHERE id = $3 RETURNING *',
            [JSON.stringify(newSizeStock), totalStock, product.id]
        );

        console.log("Updated Product:", updateRes.rows[0]);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        process.exit(0);
    }
}

testUpdate();
