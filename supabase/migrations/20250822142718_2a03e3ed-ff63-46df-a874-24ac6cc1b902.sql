-- Fix security issue: Set search_path for the function
CREATE OR REPLACE FUNCTION trigger_qr_code_generation()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Call the edge function to generate QR code asynchronously
  -- This will be handled by the application layer when a new PO is created
  RETURN NEW;
END;
$$;