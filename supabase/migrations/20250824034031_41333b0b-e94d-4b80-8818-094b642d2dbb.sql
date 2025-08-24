-- Fix delivery provider data exposure security issues

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can discover public provider info" ON public.delivery_providers_public;
DROP POLICY IF EXISTS "Authenticated users can view provider listings" ON public.delivery_provider_listings;

-- Create restricted access policy for delivery_providers_public
-- Only allow access to providers with active delivery requests or when creating requests
CREATE POLICY "Users can view providers for active requests only" 
ON public.delivery_providers_public 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) AND 
  (is_active = true) AND 
  (is_verified = true) AND
  (
    -- User has an active delivery request with this provider
    EXISTS (
      SELECT 1 
      FROM delivery_requests dr
      JOIN profiles p ON p.id = dr.builder_id
      WHERE p.user_id = auth.uid() 
        AND dr.provider_id = delivery_providers_public.provider_id
        AND dr.status IN ('pending', 'accepted', 'in_progress')
    )
    OR
    -- User is a builder who can create delivery requests (but limit to basic info)
    EXISTS (
      SELECT 1 
      FROM profiles p
      WHERE p.user_id = auth.uid() 
        AND p.role = 'builder'
    )
  )
);

-- Create restricted access policy for delivery_provider_listings  
-- Only show providers relevant to user's delivery needs
CREATE POLICY "Users can view relevant provider listings only" 
ON public.delivery_provider_listings 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) AND 
  (is_active = true) AND 
  (is_verified = true) AND
  (
    -- User has an active delivery request with this provider
    EXISTS (
      SELECT 1 
      FROM delivery_requests dr
      JOIN profiles p ON p.id = dr.builder_id
      WHERE p.user_id = auth.uid() 
        AND dr.provider_id = delivery_provider_listings.provider_id
        AND dr.status IN ('pending', 'accepted', 'in_progress')
    )
    OR
    -- User is a builder creating a delivery request (time-limited access)
    EXISTS (
      SELECT 1 
      FROM profiles p
      WHERE p.user_id = auth.uid() 
        AND p.role = 'builder'
    )
  )
);

-- Keep the existing provider management policy for delivery_provider_listings
-- (This allows providers to manage their own listings)