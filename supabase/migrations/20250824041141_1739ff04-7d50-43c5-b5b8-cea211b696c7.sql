-- Fix delivery provider personal information security vulnerability

-- Drop the ineffective policy that blocks all builder access
DROP POLICY IF EXISTS "Builders can view basic provider info for active requests only" ON public.delivery_providers;

-- Verify secure functions exist and are properly implemented
CREATE OR REPLACE FUNCTION public.get_provider_business_info(provider_uuid uuid)
RETURNS TABLE(
  id uuid, 
  provider_name text, 
  provider_type text, 
  vehicle_types text[], 
  service_areas text[], 
  capacity_kg numeric, 
  is_verified boolean, 
  is_active boolean, 
  rating numeric, 
  total_deliveries integer
)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_profile_record profiles%ROWTYPE;
  has_active_request boolean := false;
BEGIN
  -- Get the current user's profile
  SELECT * INTO user_profile_record 
  FROM profiles 
  WHERE user_id = auth.uid();
  
  -- Check if user has active delivery request with this provider
  SELECT EXISTS(
    SELECT 1 FROM delivery_requests dr
    JOIN profiles p ON p.id = dr.builder_id
    WHERE p.user_id = auth.uid() 
    AND dr.provider_id = provider_uuid
    AND dr.status IN ('pending', 'accepted', 'in_progress')
  ) INTO has_active_request;
  
  -- Only return data if user has legitimate business need
  IF user_profile_record.role = 'admin' OR has_active_request THEN
    -- Log the access for security monitoring
    PERFORM log_profile_access(provider_uuid, 'provider_business_info_view');
    
    RETURN QUERY
    SELECT 
      dp.id,
      dp.provider_name,
      dp.provider_type,
      dp.vehicle_types,
      dp.service_areas,
      dp.capacity_kg,
      dp.is_verified,
      dp.is_active,
      dp.rating,
      dp.total_deliveries
    FROM delivery_providers dp
    WHERE dp.id = provider_uuid;
  END IF;
  
  -- Return nothing if no legitimate business relationship
  RETURN;
END;
$$;

-- Create function for providers to access their own full profile
CREATE OR REPLACE FUNCTION public.get_my_provider_profile()
RETURNS TABLE(
  id uuid, 
  provider_name text, 
  provider_type text, 
  phone text, 
  email text, 
  address text, 
  vehicle_types text[], 
  service_areas text[], 
  capacity_kg numeric, 
  hourly_rate numeric, 
  per_km_rate numeric, 
  driving_license_number text, 
  driving_license_class text, 
  driving_license_expiry date, 
  driving_license_verified boolean, 
  driving_license_document_path text, 
  availability_schedule jsonb, 
  is_verified boolean, 
  is_active boolean, 
  rating numeric, 
  total_deliveries integer, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone
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
  
  -- Only return full profile data to the provider themselves or admin
  RETURN QUERY
  SELECT 
    dp.id,
    dp.provider_name,
    dp.provider_type,
    dp.phone,
    dp.email,
    dp.address,
    dp.vehicle_types,
    dp.service_areas,
    dp.capacity_kg,
    dp.hourly_rate,
    dp.per_km_rate,
    dp.driving_license_number,
    dp.driving_license_class,
    dp.driving_license_expiry,
    dp.driving_license_verified,
    dp.driving_license_document_path,
    dp.availability_schedule,
    dp.is_verified,
    dp.is_active,
    dp.rating,
    dp.total_deliveries,
    dp.created_at,
    dp.updated_at
  FROM delivery_providers dp
  WHERE dp.user_id = user_profile_record.id
    AND (user_profile_record.role = 'admin' OR dp.user_id = user_profile_record.id);
END;
$$;

-- Create secure contact access function for active deliveries only
CREATE OR REPLACE FUNCTION public.get_provider_contact_for_delivery(delivery_request_uuid uuid)
RETURNS TABLE(
  provider_name text,
  phone text,
  can_contact boolean
)
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
DECLARE
  user_profile_record profiles%ROWTYPE;
  request_record delivery_requests%ROWTYPE;
BEGIN
  -- Get current user profile
  SELECT * INTO user_profile_record 
  FROM profiles 
  WHERE user_id = auth.uid();
  
  -- Get delivery request details
  SELECT * INTO request_record
  FROM delivery_requests
  WHERE id = delivery_request_uuid;
  
  -- Only allow contact access if user is the builder for this request and delivery is active
  IF user_profile_record.id = request_record.builder_id 
     AND request_record.status IN ('accepted', 'in_progress') THEN
    
    -- Log the contact access
    PERFORM log_profile_access(request_record.provider_id, 'provider_contact_access');
    
    RETURN QUERY
    SELECT 
      dp.provider_name,
      dp.phone,
      true as can_contact
    FROM delivery_providers dp
    WHERE dp.id = request_record.provider_id;
  ELSE
    -- Return limited info for unauthorized access
    RETURN QUERY
    SELECT 
      'Contact available after delivery confirmation'::text as provider_name,
      NULL::text as phone,
      false as can_contact;
  END IF;
END;
$$;