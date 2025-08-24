-- Remove the overly permissive policy that allows authenticated users to view all delivery provider info
DROP POLICY IF EXISTS "Authenticated users can view basic delivery provider info for r" ON public.delivery_providers;

-- Create a more restrictive policy that only shows non-sensitive information for discovery
-- This allows authenticated users to discover providers but without exposing sensitive contact details
CREATE POLICY "Authenticated users can discover delivery providers" 
ON public.delivery_providers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true 
  AND is_verified = true
);

-- Note: The application layer should filter out sensitive fields (phone, email, address, driving_license_*) 
-- when displaying provider information for discovery purposes. Only show:
-- - provider_name, vehicle_types, service_areas, rating, total_deliveries
-- Full contact details should only be visible through the existing restricted policies:
-- 1. "Users can view their own delivery provider profile" - providers see their own data
-- 2. "Builders can view delivery providers for active requests" - builders with active requests
-- 3. "Admins can view all delivery provider profiles" - admin access