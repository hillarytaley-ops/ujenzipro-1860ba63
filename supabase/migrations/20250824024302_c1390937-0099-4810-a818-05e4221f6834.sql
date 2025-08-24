-- Remove duplicate discovery policies to avoid confusion and potential security gaps
DROP POLICY IF EXISTS "Authenticated users can discover providers with limited info" ON public.delivery_providers;
DROP POLICY IF EXISTS "Authenticated users limited discovery access" ON public.delivery_providers;

-- The security scanner is still detecting issues because even with restricted column selection,
-- there are policies that technically allow access to sensitive data. 
-- We need to completely remove discovery access except for legitimate business relationships.

-- Remove all discovery access - users can only see providers if they have a business relationship
-- This approach ensures no sensitive data exposure for discovery purposes.

-- The remaining policies that provide legitimate access are:
-- 1. "Users can view their own delivery provider profile" - providers see their own data
-- 2. "Builders can view delivery providers for active requests" - builders with active requests
-- 3. "Admins can view all delivery provider profiles" - admin access

-- For provider discovery, the application should use a different approach such as:
-- 1. A separate discovery endpoint that returns only basic info
-- 2. Server-side filtering that never exposes sensitive columns
-- 3. A separate table for public provider information

COMMENT ON TABLE public.delivery_providers IS 'Contains sensitive delivery provider information including contact details and driving license data. Access is restricted to: 1) The provider themselves, 2) Builders with active delivery requests involving that provider, 3) Admins. No general discovery access is allowed to protect sensitive personal information.';