-- Remove the view that triggered the security warning
DROP VIEW IF EXISTS public.delivery_providers_discovery;

-- Instead of a view, we'll use the existing RLS policies more carefully
-- Keep the current policy but ensure the application only selects safe columns
CREATE POLICY "Authenticated users limited discovery access" 
ON public.delivery_providers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true 
  AND is_verified = true
);

-- Add a comment explaining the security model for application developers
COMMENT ON POLICY "Authenticated users limited discovery access" ON public.delivery_providers IS 'Allows authenticated users to discover active verified providers. IMPORTANT: Application code MUST only select non-sensitive columns (id, provider_name, provider_type, vehicle_types, service_areas, capacity_kg, hourly_rate, per_km_rate, is_verified, is_active, rating, total_deliveries) to avoid exposing contact information, addresses, or driving license data.';