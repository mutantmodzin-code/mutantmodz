-- Update customers and users table for richer authentication

-- Add columns to customers for OTP and authentication (for regular users)
ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS otp_hash TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Ensure users (admins) can also have phone numbers if needed
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(100) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expiry TIMESTAMP;
