-- Create enhanced RLS policies for deliveries table to protect driver personal information
-- First drop existing policies
DROP POLICY IF EXISTS "Builders and suppliers can manage deliveries" ON deliveries;
DROP POLICY IF EXISTS "Users can view relevant deliveries" ON deliveries;

-- Create function to check if user can access delivery driver info
CREATE OR REPLACE FUNCTION public.can_access_driver_info(delivery_record deliveries)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' OR
      p.id = delivery_record.builder_id OR
      s.id = delivery_record.supplier_id
    )
  );
$$;

-- Create view for safe delivery information (without driver personal details)
CREATE OR REPLACE VIEW public.deliveries_safe AS
SELECT 
  id,
  material_type,
  quantity,
  weight_kg,
  pickup_date,
  delivery_date,
  estimated_delivery_time,
  actual_delivery_time,
  created_at,
  updated_at,
  pickup_address,
  delivery_address,
  tracking_number,
  status,
  vehicle_details,
  notes,
  builder_id,
  supplier_id,
  project_id,
  -- Only show driver info if user has proper access
  CASE 
    WHEN public.can_access_driver_info(deliveries.*) THEN driver_name
    ELSE 'Driver Assigned'
  END as driver_name,
  CASE 
    WHEN public.can_access_driver_info(deliveries.*) THEN driver_phone
    ELSE NULL
  END as driver_phone
FROM deliveries;

-- Enable RLS on the view
ALTER VIEW public.deliveries_safe SET (security_barrier = true);

-- Create new granular RLS policies for deliveries table
CREATE POLICY "Admin full access to deliveries"
ON deliveries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Builders can view their deliveries"
ON deliveries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND id = deliveries.builder_id
  )
);

CREATE POLICY "Suppliers can view their deliveries"
ON deliveries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM suppliers s
    JOIN profiles p ON p.id = s.user_id
    WHERE p.user_id = auth.uid() AND s.id = deliveries.supplier_id
  )
);

CREATE POLICY "Builders can create deliveries"
ON deliveries
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND id = deliveries.builder_id
  )
);

CREATE POLICY "Suppliers can update their delivery status"
ON deliveries
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM suppliers s
    JOIN profiles p ON p.id = s.user_id
    WHERE p.user_id = auth.uid() AND s.id = deliveries.supplier_id
  )
)
WITH CHECK (
  -- Only allow updating specific fields, not driver personal info
  OLD.driver_name = NEW.driver_name AND
  OLD.driver_phone = NEW.driver_phone
);

-- Grant access to the safe view
GRANT SELECT ON public.deliveries_safe TO authenticated;

-- Create RLS policy for the safe view
CREATE POLICY "Users can view safe delivery information"
ON public.deliveries_safe
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' OR
      p.id = deliveries_safe.builder_id OR
      s.id = deliveries_safe.supplier_id
    )
  )
);

-- Create audit log for driver information access
CREATE TABLE IF NOT EXISTS public.driver_info_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  delivery_id uuid REFERENCES deliveries(id),
  accessed_at timestamp with time zone DEFAULT now(),
  access_type text NOT NULL, -- 'view', 'export', etc.
  ip_address inet,
  user_agent text
);

ALTER TABLE public.driver_info_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view access logs"
ON public.driver_info_access_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to log driver info access
CREATE OR REPLACE FUNCTION public.log_driver_info_access(
  delivery_uuid uuid,
  access_type_param text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO driver_info_access_log (user_id, delivery_id, access_type)
  VALUES (auth.uid(), delivery_uuid, access_type_param);
END;
$$;