-- Create a function to trigger QR code generation
CREATE OR REPLACE FUNCTION trigger_qr_code_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the edge function to generate QR code asynchronously
  -- This will be handled by the application layer when a new PO is created
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new purchase orders
CREATE TRIGGER generate_qr_on_purchase_order_insert
  AFTER INSERT ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_qr_code_generation();