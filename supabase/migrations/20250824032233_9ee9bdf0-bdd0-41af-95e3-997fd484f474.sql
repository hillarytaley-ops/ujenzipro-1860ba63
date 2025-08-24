-- Create enhanced security for delivery addresses and driver contact information
-- Create function to check if user can access sensitive location data
CREATE OR REPLACE FUNCTION public.can_access_location_data(delivery_record deliveries)
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

-- Create function to check if user can access driver contact information
CREATE OR REPLACE FUNCTION public.can_access_driver_contact(delivery_record deliveries)
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
      (s.id = delivery_record.supplier_id AND delivery_record.status IN ('in_progress', 'delivered'))
    )
  );
$$;

-- Create audit log for sensitive location data access
CREATE TABLE IF NOT EXISTS public.location_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  delivery_id uuid REFERENCES deliveries(id),
  accessed_at timestamp with time zone DEFAULT now(),
  access_type text NOT NULL, -- 'pickup_address', 'delivery_address', 'driver_phone', 'full_view'
  ip_address inet,
  user_agent text,
  data_fields_accessed text[] -- which sensitive fields were accessed
);

ALTER TABLE public.location_data_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view location access logs"
ON public.location_data_access_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to log location data access
CREATE OR REPLACE FUNCTION public.log_location_data_access(
  delivery_uuid uuid,
  access_type_param text,
  fields_accessed text[] DEFAULT ARRAY[]::text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO location_data_access_log (
    user_id, 
    delivery_id, 
    access_type, 
    data_fields_accessed
  )
  VALUES (
    auth.uid(), 
    delivery_uuid, 
    access_type_param, 
    fields_accessed
  );
END;
$$;

-- Create secure function to get delivery data with controlled access to sensitive information
CREATE OR REPLACE FUNCTION public.get_secure_delivery(delivery_uuid uuid)
RETURNS TABLE (
  id uuid,
  material_type text,
  quantity integer,
  weight_kg numeric,
  pickup_date date,
  delivery_date date,
  estimated_delivery_time timestamptz,
  actual_delivery_time timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  tracking_number text,
  status text,
  vehicle_details text,
  notes text,
  builder_id uuid,
  supplier_id uuid,
  project_id uuid,
  can_view_locations boolean,
  can_view_driver_contact boolean,
  pickup_address text,
  delivery_address text,
  driver_name text,
  driver_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_access_locations boolean;
  can_access_driver boolean;
  record_data deliveries%ROWTYPE;
BEGIN
  -- Get the delivery record
  SELECT * INTO record_data 
  FROM deliveries 
  WHERE deliveries.id = delivery_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check permissions
  SELECT public.can_access_location_data(record_data) INTO can_access_locations;
  SELECT public.can_access_driver_contact(record_data) INTO can_access_driver;
  
  -- Log access if sensitive fields are being viewed
  IF can_access_locations THEN
    PERFORM public.log_location_data_access(
      delivery_uuid, 
      'location_view', 
      ARRAY['pickup_address', 'delivery_address']
    );
  END IF;
  
  IF can_access_driver THEN
    PERFORM public.log_location_data_access(
      delivery_uuid, 
      'driver_contact_view', 
      ARRAY['driver_name', 'driver_phone']
    );
  END IF;
  
  -- Return data with conditional sensitive information
  RETURN QUERY SELECT
    record_data.id,
    record_data.material_type,
    record_data.quantity,
    record_data.weight_kg,
    record_data.pickup_date,
    record_data.delivery_date,
    record_data.estimated_delivery_time,
    record_data.actual_delivery_time,
    record_data.created_at,
    record_data.updated_at,
    record_data.tracking_number,
    record_data.status,
    record_data.vehicle_details,
    record_data.notes,
    record_data.builder_id,
    record_data.supplier_id,
    record_data.project_id,
    can_access_locations,
    can_access_driver,
    CASE WHEN can_access_locations THEN record_data.pickup_address ELSE 'Pickup location available to authorized parties' END,
    CASE WHEN can_access_locations THEN record_data.delivery_address ELSE 'Delivery location available to authorized parties' END,
    CASE WHEN can_access_driver THEN record_data.driver_name ELSE 'Driver assigned' END,
    CASE WHEN can_access_driver THEN record_data.driver_phone ELSE NULL END;
END;
$$;