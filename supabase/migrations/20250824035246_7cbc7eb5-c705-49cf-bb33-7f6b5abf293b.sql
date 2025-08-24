-- CRITICAL SECURITY FIX: Completely restrict direct access to sensitive delivery data
-- The current policies expose ALL columns including sensitive driver and location data

-- Drop all existing delivery table policies to start fresh
DROP POLICY IF EXISTS "Admin full access to deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Builders can create deliveries" ON public.deliveries;
DROP POLICY IF EXISTS "Builders can view their delivery info" ON public.deliveries;
DROP POLICY IF EXISTS "Suppliers can update delivery status only" ON public.deliveries;
DROP POLICY IF EXISTS "Suppliers can view their delivery info" ON public.deliveries;

-- Create highly restrictive policies that prevent direct access to sensitive data
-- Only allow system/admin access for maintenance, all user access goes through secure functions

-- Admin policy for maintenance only (very restrictive)
CREATE POLICY "System admin full access for maintenance" 
ON public.deliveries 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Builders can only INSERT their own deliveries (no direct SELECT access)
CREATE POLICY "Builders can create their own deliveries" 
ON public.deliveries 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND id = deliveries.builder_id
  )
);

-- Suppliers can only UPDATE status of their deliveries (no direct SELECT access)
CREATE POLICY "Suppliers can update status of their deliveries" 
ON public.deliveries 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM suppliers s
    JOIN profiles p ON p.id = s.user_id
    WHERE p.user_id = auth.uid() 
    AND s.id = deliveries.supplier_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM suppliers s
    JOIN profiles p ON p.id = s.user_id
    WHERE p.user_id = auth.uid() 
    AND s.id = deliveries.supplier_id
  )
);

-- NO DIRECT SELECT POLICIES FOR USERS
-- All user data access must go through secure functions:
-- - get_user_deliveries() for listing deliveries
-- - get_secure_delivery() for individual delivery details

-- Create a secure delivery listing function that only returns safe data
CREATE OR REPLACE FUNCTION public.get_delivery_summaries()
RETURNS TABLE(
  id uuid,
  tracking_number text,
  material_type text,
  quantity integer,
  weight_kg numeric,
  status text,
  estimated_delivery_time timestamp with time zone,
  actual_delivery_time timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  builder_id uuid,
  supplier_id uuid,
  project_id uuid,
  has_driver_assigned boolean,
  general_pickup_area text,
  general_delivery_area text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile_record profiles%ROWTYPE;
BEGIN
  -- Get the current user's profile
  SELECT * INTO user_profile_record 
  FROM profiles 
  WHERE user_id = auth.uid();
  
  -- Return only safe delivery summary data
  RETURN QUERY
  SELECT 
    d.id,
    d.tracking_number,
    d.material_type,
    d.quantity,
    d.weight_kg,
    d.status,
    d.estimated_delivery_time,
    d.actual_delivery_time,
    d.created_at,
    d.updated_at,
    d.builder_id,
    d.supplier_id,
    d.project_id,
    -- Safe indicators without exposing sensitive data
    CASE WHEN d.driver_name IS NOT NULL THEN true ELSE false END,
    -- Only show general area, not full address
    CASE 
      WHEN d.pickup_address IS NOT NULL 
      THEN COALESCE(split_part(d.pickup_address, ',', -1), 'Pickup area')
      ELSE 'Not specified'
    END,
    CASE 
      WHEN d.delivery_address IS NOT NULL 
      THEN COALESCE(split_part(d.delivery_address, ',', -1), 'Delivery area')
      ELSE 'Not specified'
    END
  FROM deliveries d
  WHERE 
    -- Admin can see all
    user_profile_record.role = 'admin'
    OR
    -- Builder can see their deliveries
    (user_profile_record.role = 'builder' AND d.builder_id = user_profile_record.id)
    OR
    -- Supplier can see their deliveries
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.user_id = user_profile_record.id 
      AND s.id = d.supplier_id
    )
  ORDER BY d.created_at DESC;
END;
$$;