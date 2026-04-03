-- Add bike_brand and bike_model to products
ALTER TABLE products ADD COLUMN bike_brand VARCHAR(100);
ALTER TABLE products ADD COLUMN bike_model VARCHAR(100);
