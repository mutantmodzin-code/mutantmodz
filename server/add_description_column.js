const db = require('./db');

async function addDescriptionColumn() {
  try {
    const res = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'description'");
    if (res.rowCount === 0) {
      console.log("Column 'description' does not exist in 'products' table. Adding it...");
      await db.query("ALTER TABLE products ADD COLUMN description TEXT");
      console.log("Column 'description' added successfully.");
    } else {
      console.log("Column 'description' already exists in 'products' table.");
    }
  } catch (err) {
    console.error("Error checking/adding description column:", err);
  } finally {
    process.exit();
  }
}

addDescriptionColumn();