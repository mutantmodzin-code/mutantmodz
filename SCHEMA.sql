-- Bike Accessories Pitshop Inventory and Billing System - PostgreSQL Schema

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    brand VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Logs (Movement tracking)
CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    change_amount INT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('addition', 'sale', 'adjustment', 'return')),
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INT REFERENCES invoices(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL
);

-- Admin Users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Sample Data
INSERT INTO categories (name, description) VALUES 
('Helmets', 'Safety gear for riders'),
('Gloves', 'Hand protection and grip'),
('Bike Parts', 'Essential mechanical components'),
('Accessories', 'Add-ons for bikes and riders');

INSERT INTO suppliers (name, contact_person, phone) VALUES 
('RideStyle Parts', 'John Smith', '123-456-7890'),
('MotoGuard Safety', 'Jane Doe', '987-654-3210');

INSERT INTO users (username, password_hash, role) VALUES 
('admin', '$2b$10$EfvGvS1x.uX0r0e.jL4r5.B1zP.wz1C.K5C5C5C5C5C5C5C5C5C', 'admin'); -- Default password hash for 'admin' (you should update this)

INSERT INTO products (name, category_id, brand, price, stock, supplier_id) VALUES 
('Full Face Helmet V2', 1, 'SafeRide', 120.00, 10, 2),
('Mountain Grip Gloves', 2, 'GripMaster', 45.00, 15, 1),
('Brake Pads Carbon', 3, 'StopFast', 25.00, 20, 1),
('Bicycle LED Light', 4, 'BrightWay', 15.00, 30, 2);
