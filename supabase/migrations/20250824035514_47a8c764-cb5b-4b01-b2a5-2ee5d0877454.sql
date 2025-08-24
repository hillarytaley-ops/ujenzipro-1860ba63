-- CRITICAL SECURITY FIX: Protect delivery provider personal information
-- Current policy exposes ALL sensitive personal data to builders with active requests

-- Drop the overly permissive policy that exposes personal information
DROP POLICY IF EXISTS "Builders can view delivery providers for active requests" ON public.delivery_providers;

-- Create a highly restrictive policy for builders that only allows business-related access
-- Builders should NEVER see personal information like home addresses, phone numbers, emails, or license details
CREATE POLICY "Builders can view basic provider info for active requests only" 
ON public.delivery_providers 
FOR SELECT 
USING (
  -- Only allow access to verify provider exists for active requests
  -- But this will be limited by a secure function, not direct table access
  false -- Block all direct access, force use of secure functions
);

-- Create secure function for builders to get only necessary provider information
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

-- Create secure function for providers to manage their own sensitive information
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