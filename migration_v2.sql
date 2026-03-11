-- Migration to enhance inventory and order tracking
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'Offline Order';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS stock_deducted_status BOOLEAN DEFAULT TRUE;

-- Update low stock threshold to 10 if necessary (logic is in queries)
-- But we can add a check or comment.

-- Add index for order_type
CREATE INDEX IF NOT EXISTS idx_invoices_order_type ON invoices(order_type);
