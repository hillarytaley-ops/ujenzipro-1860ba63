-- Fix security warning: Set search_path for function to prevent path-based attacks
CREATE OR REPLACE FUNCTION match_supply_with_receivable()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When a receivable is scanned, try to match it with a dispatched supply
  IF NEW.qr_code IS NOT NULL THEN
    UPDATE scanned_supplies 
    SET 
      status = 'delivered',
      updated_at = now()
    WHERE qr_code = NEW.qr_code 
      AND dispatch_status = 'dispatched'
      AND scanned_for_dispatch = true;
    
    -- Update the receivable with matched supply info
    UPDATE scanned_receivables 
    SET matched_supply_id = (
      SELECT id FROM scanned_supplies 
      WHERE qr_code = NEW.qr_code 
        AND dispatch_status = 'dispatched'
        AND scanned_for_dispatch = true
      LIMIT 1
    )
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;