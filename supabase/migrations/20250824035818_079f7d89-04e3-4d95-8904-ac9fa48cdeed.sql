-- Fix critical security issue: Remove overly permissive policies and implement proper access controls

-- First, drop the overly broad projects policy that allows anyone to see all projects
DROP POLICY IF EXISTS "Users can view all projects" ON public.projects;

-- Create a more restrictive projects policy that only allows viewing:
-- 1. Projects you own (as builder)
-- 2. Projects you have active business relationships with
-- 3. Admin access
CREATE POLICY "Users can view relevant projects only" ON public.projects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND (
      -- Admin can see all projects
      p.role = 'admin' 
      OR 
      -- Builder can see their own projects
      p.id = projects.builder_id
      OR
      -- Suppliers can see projects they have quotation requests for
      EXISTS (
        SELECT 1 FROM suppliers s 
        JOIN quotation_requests qr ON s.id = qr.supplier_id 
        WHERE s.user_id = p.id 
        AND qr.project_id = projects.id
      )
      OR
      -- Delivery providers can see projects for active delivery requests
      EXISTS (
        SELECT 1 FROM delivery_providers dp
        JOIN delivery_requests dr ON dp.id = dr.provider_id
        JOIN deliveries d ON d.project_id = projects.id
        WHERE dp.user_id = p.id
        AND dr.status IN ('accepted', 'in_progress')
      )
    )
  )
);

-- Review and tighten profiles table policies
-- Drop any potentially overly broad policies on profiles
DROP POLICY IF EXISTS "Builders can view relevant supplier profiles" ON public.profiles;
DROP POLICY IF EXISTS "Suppliers can view relevant builder profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view delivery provider profiles for active requests" ON public.profiles;

-- Create more secure profile viewing policies with stricter validation
CREATE POLICY "Builders can view supplier profiles for active business only" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND role = 'supplier' 
  AND EXISTS (
    SELECT 1 FROM quotation_requests qr
    JOIN suppliers s ON s.id = qr.supplier_id
    JOIN profiles requester ON requester.id = qr.requester_id
    WHERE s.user_id = profiles.id 
    AND requester.user_id = auth.uid()
    AND qr.status IN ('pending', 'accepted')  -- Only active requests
    AND qr.created_at > NOW() - INTERVAL '90 days'  -- Recent requests only
  )
);

CREATE POLICY "Suppliers can view builder profiles for active business only" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND role = 'builder' 
  AND EXISTS (
    SELECT 1 FROM quotation_requests qr
    JOIN suppliers s ON s.id = qr.supplier_id
    WHERE qr.requester_id = profiles.id 
    AND s.user_id = auth.uid()
    AND qr.status IN ('pending', 'accepted')  -- Only active requests
    AND qr.created_at > NOW() - INTERVAL '90 days'  -- Recent requests only
  )
);

CREATE POLICY "Users can view delivery provider profiles for confirmed requests only" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM delivery_providers dp
    JOIN delivery_requests dr ON dp.id = dr.provider_id
    JOIN profiles requester ON requester.id = dr.builder_id
    WHERE dp.user_id = profiles.id 
    AND requester.user_id = auth.uid()
    AND dr.status IN ('accepted', 'in_progress')  -- Only confirmed requests
  )
);

-- Create access logging for profile views to monitor for suspicious activity
CREATE TABLE IF NOT EXISTS profile_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id uuid,
  viewed_profile_id uuid,
  access_type text NOT NULL,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on the access log
ALTER TABLE profile_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view access logs
CREATE POLICY "Admin can view profile access logs" ON profile_access_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create function to log profile access
CREATE OR REPLACE FUNCTION log_profile_access(
  viewed_profile_uuid uuid, 
  access_type_param text
) 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO profile_access_log (viewer_user_id, viewed_profile_id, access_type)
  VALUES (auth.uid(), viewed_profile_uuid, access_type_param);
END;
$$;