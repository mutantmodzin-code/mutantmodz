const db = require('./db');

async function checkSubCategory() {
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'sub_category'");
    if (res.rowCount === 0) {
      console.log("Column 'sub_category' does not exist in 'products' table. Adding it...");
      await db.query("ALTER TABLE products ADD COLUMN sub_category VARCHAR(100)");
      console.log("Column 'sub_category' added successfully.");
    } else {
      console.log("Column 'sub_category' already exists in 'products' table.");
    }
  } catch (err) {
    console.error("Error checking/adding sub_category column:", err);
  } finally {
    process.exit();
  }
}

checkSubCategory();