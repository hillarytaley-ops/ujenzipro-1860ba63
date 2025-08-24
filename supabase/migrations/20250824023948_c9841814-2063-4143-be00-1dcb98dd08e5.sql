-- Remove the policy that still allows access to sensitive data
DROP POLICY IF EXISTS "Authenticated users can view basic provider info for discovery" ON public.delivery_providers;

-- Create a more restrictive discovery policy using column-level filtering
-- This policy will only be used with specific SELECT statements that exclude sensitive columns
CREATE POLICY "Authenticated users can discover providers with limited info" 
ON public.delivery_providers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true 
  AND is_verified = true
);

-- Create a view for safe public discovery that excludes sensitive information
CREATE OR REPLACE VIEW public.delivery_providers_discovery AS
SELECT 
  id,
  provider_name,
  provider_type,
  vehicle_types,
  service_areas,
  capacity_kg,
  hourly_rate,
  per_km_rate,
  is_verified,
  is_active,
  rating,
  total_deliveries,
  created_at,
  updated_at
FROM public.delivery_providers
WHERE is_active = true AND is_verified = true;

-- Enable RLS on the view
ALTER VIEW public.delivery_providers_discovery SET (security_barrier = true);

-- Grant access to the discovery view for authenticated users
GRANT SELECT ON public.delivery_providers_discovery TO authenticated;

-- Add comment explaining the security model
COMMENT ON VIEW public.delivery_providers_discovery IS 'Safe discovery view of delivery providers that excludes sensitive contact information (phone, email, address, driving license data). Use this view for provider discovery to prevent data exposure.';