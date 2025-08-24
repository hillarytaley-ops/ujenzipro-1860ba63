-- Fix driver personal information exposure by restricting RLS policies
-- The current policies allow full SELECT access which exposes driver info

-- Drop existing policies that expose driver info
DROP POLICY IF EXISTS "Builders can view their deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Suppliers can view their deliveries" ON public.deliveries;

-- Create new restrictive policies that protect driver information
-- Builders can view delivery info but without driver personal details
CREATE POLICY "Builders can view their delivery info" 
ON public.deliveries 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = deliveries.builder_id
  )
);

-- Suppliers can view delivery info but without driver personal details  
CREATE POLICY "Suppliers can view their delivery info"
ON public.deliveries
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM suppliers s
    JOIN profiles p ON p.id = s.user_id
    WHERE p.user_id = auth.uid() 
    AND s.id = deliveries.supplier_id
  )
);

-- Create a view that exposes only non-sensitive delivery data
CREATE OR REPLACE VIEW public.deliveries_safe AS
SELECT 
  id,
  tracking_number,
  material_type,
  quantity,
  weight_kg,
  pickup_date,
  delivery_date,
  estimated_delivery_time,
  actual_delivery_time,
  status,
  vehicle_details,
  notes,
  created_at,
  updated_at,
  builder_id,
  supplier_id,
  project_id,
  -- Hide sensitive location and driver info
  CASE 
    WHEN public.can_access_location_data(ROW(deliveries.*)) 
    THEN pickup_address 
    ELSE 'Location protected for privacy'
  END as pickup_address,
  CASE 
    WHEN public.can_access_location_data(ROW(deliveries.*)) 
    THEN delivery_address 
    ELSE 'Location protected for privacy' 
  END as delivery_address,
  CASE 
    WHEN public.can_access_driver_contact(ROW(deliveries.*)) 
    THEN driver_name 
    ELSE NULL
  END as driver_name,
  CASE 
    WHEN public.can_access_driver_contact(ROW(deliveries.*)) 
    THEN driver_phone 
    ELSE NULL
  END as driver_phone
FROM deliveries;

-- Enable RLS on the safe view
ALTER VIEW public.deliveries_safe SET (security_barrier = true);

-- Grant access to the safe view
GRANT SELECT ON public.deliveries_safe TO authenticated;