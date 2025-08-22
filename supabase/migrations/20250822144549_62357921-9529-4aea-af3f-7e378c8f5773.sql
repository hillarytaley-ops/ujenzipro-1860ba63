-- Add status tracking columns to material tables for better dispatch/delivery tracking
ALTER TABLE scanned_supplies 
ADD COLUMN IF NOT EXISTS dispatch_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS dispatched_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS dispatched_by uuid,
ADD COLUMN IF NOT EXISTS delivery_order_id uuid,
ADD COLUMN IF NOT EXISTS scanned_for_dispatch boolean DEFAULT false;

ALTER TABLE scanned_receivables 
ADD COLUMN IF NOT EXISTS received_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS received_by uuid,
ADD COLUMN IF NOT EXISTS delivery_order_id uuid,
ADD COLUMN IF NOT EXISTS matched_supply_id uuid;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_scanned_supplies_dispatch ON scanned_supplies(dispatch_status, dispatched_at);
CREATE INDEX IF NOT EXISTS idx_scanned_receivables_received ON scanned_receivables(received_status, received_at);
CREATE INDEX IF NOT EXISTS idx_supplies_qr_code ON scanned_supplies(qr_code);
CREATE INDEX IF NOT EXISTS idx_receivables_qr_code ON scanned_receivables(qr_code);

-- Enable realtime for material tracking tables
ALTER TABLE scanned_supplies REPLICA IDENTITY FULL;
ALTER TABLE scanned_receivables REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE scanned_supplies;
ALTER PUBLICATION supabase_realtime ADD TABLE scanned_receivables;

-- Update RLS policies to allow proper tracking across roles
DROP POLICY IF EXISTS "Suppliers can manage their scanned supplies" ON scanned_supplies;
CREATE POLICY "Suppliers can manage their scanned supplies" ON scanned_supplies
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM suppliers s
    JOIN profiles p ON p.id = s.user_id
    WHERE p.user_id = auth.uid() AND s.id = scanned_supplies.supplier_id
  ) OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Project members can manage receivables" ON scanned_receivables;
CREATE POLICY "Project members can manage receivables" ON scanned_receivables
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM projects pr
    JOIN profiles p ON p.id = pr.builder_id
    WHERE p.user_id = auth.uid() AND pr.id = scanned_receivables.project_id
  ) OR 
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  ) OR
  EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'supplier'
  )
);

-- Function to match supplies with receivables automatically
CREATE OR REPLACE FUNCTION match_supply_with_receivable()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic matching
DROP TRIGGER IF EXISTS trigger_match_supply_receivable ON scanned_receivables;
CREATE TRIGGER trigger_match_supply_receivable
  AFTER INSERT OR UPDATE ON scanned_receivables
  FOR EACH ROW
  EXECUTE FUNCTION match_supply_with_receivable();