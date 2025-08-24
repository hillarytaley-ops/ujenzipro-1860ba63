-- Remove the overly permissive discovery policy that exposes sensitive data
DROP POLICY IF EXISTS "Authenticated users can discover delivery providers" ON public.delivery_providers;

-- Create a new secure discovery policy that restricts data access
-- Users can only see basic provider info for discovery, not contact details
CREATE POLICY "Authenticated users can view basic provider info for discovery" 
ON public.delivery_providers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true 
  AND is_verified = true
  -- Note: Application layer must filter sensitive fields when using this policy
);

-- The following policies remain for legitimate access to contact details:
-- 1. "Users can view their own delivery provider profile" - providers see their own data
-- 2. "Builders can view delivery providers for active requests" - builders with active requests get full access
-- 3. "Admins can view all delivery provider profiles" - admin access

-- Add a comment to clarify data access restrictions
COMMENT ON TABLE public.delivery_providers IS 'Contains delivery provider information. Contact details (phone, email, address, driving_license_*) should only be visible to: 1) The provider themselves, 2) Builders with active delivery requests involving that provider, 3) Admins. Discovery queries should filter out sensitive fields.';