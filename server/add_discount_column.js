const db = require('./db');

async function addDiscountColumn() {
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'discount_percent'");
    if (res.rowCount === 0) {
      console.log("Column 'discount_percent' does not exist in 'products' table. Adding it...");
      await db.query("ALTER TABLE products ADD COLUMN discount_percent DECIMAL(5,2) DEFAULT 0");
      console.log("Column 'discount_percent' added successfully.");
    } else {
      console.log("Column 'discount_percent' already exists in 'products' table.");
    }
  } catch (err) {
    console.error("Error checking/adding discount_percent column:", err);
  } finally {
    process.exit();
  }
}

addDiscountColumn();