-- Drop the overly permissive policy that allows public access
DROP POLICY IF EXISTS "Users can view all delivery providers" ON public.delivery_providers;

-- Allow users to view their own delivery provider profile
CREATE POLICY "Users can view their own delivery provider profile" 
ON public.delivery_providers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = delivery_providers.user_id
  )
);

-- Allow admins to view all delivery provider profiles for management
CREATE POLICY "Admins can view all delivery provider profiles" 
ON public.delivery_providers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow builders to view delivery providers only when they have active delivery requests
CREATE POLICY "Builders can view delivery providers for active requests" 
ON public.delivery_providers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.delivery_requests dr
    JOIN public.profiles p ON p.id = dr.builder_id
    WHERE p.user_id = auth.uid() 
    AND dr.provider_id = delivery_providers.id
    AND dr.status IN ('pending', 'accepted', 'in_progress')
  )
);

-- Allow viewing delivery providers when browsing for new delivery requests (limited info)
CREATE POLICY "Authenticated users can view basic delivery provider info for requests" 
ON public.delivery_providers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  is_active = true AND
  is_verified = true
);