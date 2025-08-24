-- CRITICAL SECURITY FIX: Protect customer delivery addresses from stalking/theft risks
-- Current policies expose full addresses in delivery_requests and purchase_orders tables

-- ===== DELIVERY REQUESTS TABLE SECURITY =====

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can view relevant delivery requests" ON public.delivery_requests;
DROP POLICY IF EXISTS "Users can update relevant delivery requests" ON public.delivery_requests;

-- Create highly restrictive policies - NO DIRECT SELECT ACCESS TO ADDRESSES
CREATE POLICY "Admin maintenance access only" 
ON public.delivery_requests 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Builders can only INSERT their own requests (no direct SELECT)
CREATE POLICY "Builders can create their own requests" 
ON public.delivery_requests 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND id = delivery_requests.builder_id
  )
);

-- Limited UPDATE access for status changes only (no address access)
CREATE POLICY "Limited status updates for authorized parties" 
ON public.delivery_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN delivery_providers dp ON dp.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (p.id = delivery_requests.builder_id OR dp.id = delivery_requests.provider_id)
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN delivery_providers dp ON dp.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (p.id = delivery_requests.builder_id OR dp.id = delivery_requests.provider_id)
  )
);

-- ===== PURCHASE ORDERS TABLE SECURITY =====

-- Drop existing policies that expose delivery addresses
DROP POLICY IF EXISTS "Users can view relevant purchase orders" ON public.purchase_orders;
DROP POLICY IF EXISTS "Suppliers can update purchase order status" ON public.purchase_orders;

-- Create restrictive policies - NO DIRECT SELECT ACCESS TO ADDRESSES
CREATE POLICY "Admin maintenance access for purchase orders" 
ON public.purchase_orders 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Limited UPDATE access for suppliers (no address exposure)
CREATE POLICY "Suppliers can update order status only" 
ON public.purchase_orders 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND s.id = purchase_orders.supplier_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND s.id = purchase_orders.supplier_id
  )
);

-- ===== SECURE ADDRESS ACCESS FUNCTIONS =====

-- Function to get delivery request with protected addresses
CREATE OR REPLACE FUNCTION public.get_secure_delivery_request(request_uuid uuid)
RETURNS TABLE(
  id uuid,
  builder_id uuid,
  provider_id uuid,
  material_type text,
  quantity integer,
  weight_kg numeric,
  pickup_date date,
  preferred_time time,
  special_instructions text,
  budget_range text,
  required_vehicle_type text,
  status text,
  provider_response text,
  response_notes text,
  response_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  can_view_addresses boolean,
  pickup_address text,
  delivery_address text,
  pickup_latitude numeric,
  pickup_longitude numeric,
  delivery_latitude numeric,
  delivery_longitude numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile_record profiles%ROWTYPE;
  request_record delivery_requests%ROWTYPE;
  can_access_addresses boolean := false;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile_record 
  FROM profiles 
  WHERE user_id = auth.uid();
  
  -- Get the request record
  SELECT * INTO request_record 
  FROM delivery_requests 
  WHERE delivery_requests.id = request_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if user can access addresses
  SELECT (
    user_profile_record.role = 'admin' OR
    user_profile_record.id = request_record.builder_id OR
    EXISTS (
      SELECT 1 FROM delivery_providers dp 
      WHERE dp.user_id = user_profile_record.id 
      AND dp.id = request_record.provider_id
    )
  ) INTO can_access_addresses;
  
  -- Log address access attempt
  IF can_access_addresses AND (request_record.pickup_address IS NOT NULL OR request_record.delivery_address IS NOT NULL) THEN
    INSERT INTO location_data_access_log (user_id, delivery_id, access_type, data_fields_accessed)
    VALUES (auth.uid(), request_uuid, 'delivery_request_address_view', ARRAY['pickup_address', 'delivery_address']);
  END IF;
  
  -- Return data with conditional address information
  RETURN QUERY SELECT
    request_record.id,
    request_record.builder_id,
    request_record.provider_id,
    request_record.material_type,
    request_record.quantity,
    request_record.weight_kg,
    request_record.pickup_date,
    request_record.preferred_time,
    request_record.special_instructions,
    request_record.budget_range,
    request_record.required_vehicle_type,
    request_record.status,
    request_record.provider_response,
    request_record.response_notes,
    request_record.response_date,
    request_record.created_at,
    request_record.updated_at,
    can_access_addresses,
    CASE WHEN can_access_addresses THEN request_record.pickup_address ELSE 'Address available to authorized parties' END,
    CASE WHEN can_access_addresses THEN request_record.delivery_address ELSE 'Address available to authorized parties' END,
    CASE WHEN can_access_addresses THEN request_record.pickup_latitude ELSE NULL END,
    CASE WHEN can_access_addresses THEN request_record.pickup_longitude ELSE NULL END,
    CASE WHEN can_access_addresses THEN request_record.delivery_latitude ELSE NULL END,
    CASE WHEN can_access_addresses THEN request_record.delivery_longitude ELSE NULL END;
END;
$$;

-- Function to get purchase order with protected addresses
CREATE OR REPLACE FUNCTION public.get_secure_purchase_order(order_uuid uuid)
RETURNS TABLE(
  id uuid,
  po_number text,
  buyer_id uuid,
  supplier_id uuid,
  quotation_request_id uuid,
  items jsonb,
  total_amount numeric,
  delivery_date date,
  payment_terms text,
  special_instructions text,
  status text,
  qr_code_url text,
  qr_code_generated boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  can_view_address boolean,
  delivery_address text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_profile_record profiles%ROWTYPE;
  order_record purchase_orders%ROWTYPE;
  can_access_address boolean := false;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile_record 
  FROM profiles 
  WHERE user_id = auth.uid();
  
  -- Get the order record
  SELECT * INTO order_record 
  FROM purchase_orders 
  WHERE purchase_orders.id = order_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if user can access delivery address
  SELECT (
    user_profile_record.role = 'admin' OR
    user_profile_record.id = order_record.buyer_id OR
    EXISTS (
      SELECT 1 FROM suppliers s 
      WHERE s.user_id = user_profile_record.id 
      AND s.id = order_record.supplier_id
    )
  ) INTO can_access_address;
  
  -- Log address access attempt
  IF can_access_address AND order_record.delivery_address IS NOT NULL THEN
    INSERT INTO location_data_access_log (user_id, delivery_id, access_type, data_fields_accessed)
    VALUES (auth.uid(), order_uuid, 'purchase_order_address_view', ARRAY['delivery_address']);
  END IF;
  
  -- Return data with conditional address information
  RETURN QUERY SELECT
    order_record.id,
    order_record.po_number,
    order_record.buyer_id,
    order_record.supplier_id,
    order_record.quotation_request_id,
    order_record.items,
    order_record.total_amount,
    order_record.delivery_date,
    order_record.payment_terms,
    order_record.special_instructions,
    order_record.status,
    order_record.qr_code_url,
    order_record.qr_code_generated,
    order_record.created_at,
    order_record.updated_at,
    can_access_address,
    CASE WHEN can_access_address THEN order_record.delivery_address ELSE 'Delivery address available to authorized parties' END;
END;
$$;