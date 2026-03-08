-- Run this in your Supabase SQL Editor to create the products table

CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT NOT NULL,
    category TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read" ON products
    FOR SELECT USING (true);

-- Create policy to allow all actions (for your admin portal)
-- Note: In a production app, you should restrict this to authenticated admins
CREATE POLICY "Allow all for admin" ON products
    FOR ALL USING (true);
