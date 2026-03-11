-- Update schema for Pitshop Inventory and Billing System

-- 1. Rename suppliers to vendors
ALTER TABLE suppliers RENAME TO vendors;

-- 2. Update products table
-- Rename supplier_id to vendor_id
ALTER TABLE products RENAME COLUMN supplier_id TO vendor_id;

-- Add SKU and purchase_price
ALTER TABLE products ADD COLUMN sku VARCHAR(50) UNIQUE;
ALTER TABLE products ADD COLUMN purchase_price DECIMAL(10, 2) DEFAULT 0.00;

-- 3. Create product_vendor_prices for history/multiple vendors
CREATE TABLE IF NOT EXISTS product_vendor_prices (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    vendor_id INT REFERENCES vendors(id) ON DELETE CASCADE,
    purchase_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Add purchase_price to invoice_items to track profit accurately at the time of sale
ALTER TABLE invoice_items ADD COLUMN purchase_price DECIMAL(10, 2) DEFAULT 0.00;

-- Update existing invoice_items with current product purchase price (0 for now)
UPDATE invoice_items SET purchase_price = 0;
