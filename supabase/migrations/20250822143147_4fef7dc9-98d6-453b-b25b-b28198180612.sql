-- Add QR code fields to delivery_orders table for individual builders
ALTER TABLE delivery_orders 
ADD COLUMN qr_code_url TEXT,
ADD COLUMN qr_code_generated BOOLEAN DEFAULT FALSE;

-- Create trigger for delivery orders QR generation
CREATE TRIGGER generate_qr_on_delivery_order_insert
  AFTER INSERT ON delivery_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_qr_code_generation();