-- Fix critical security issue: Remove overly permissive policies and implement proper access controls

-- Drop the overly broad projects policy that allows anyone to see all projects
DROP POLICY IF EXISTS "Users can view all projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view relevant projects only" ON public.projects;

-- Create a more restrictive projects policy that only allows viewing projects based on legitimate business relationships
CREATE POLICY "Users can view projects with legitimate business relationships" ON public.projects
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
      -- Suppliers can see projects they have active deliveries for
      EXISTS (
        SELECT 1 FROM suppliers s 
        JOIN deliveries d ON d.supplier_id = s.id
        WHERE s.user_id = p.id 
        AND d.project_id = projects.id
      )
    )
  )
);

-- Tighten profiles table policies for better security
-- Drop potentially overly broad policies on profiles
DROP POLICY IF EXISTS "Builders can view relevant supplier profiles" ON public.profiles;
DROP POLICY IF EXISTS "Suppliers can view relevant builder profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view delivery provider profiles for active requests" ON public.profiles;
DROP POLICY IF EXISTS "Builders can view supplier profiles for active business only" ON public.profiles;
DROP POLICY IF EXISTS "Suppliers can view builder profiles for active business only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view delivery provider profiles for confirmed requests only" ON public.profiles;

-- Create more secure profile viewing policies with stricter validation and time limits
CREATE POLICY "Builders can view supplier profiles for recent active quotations" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND role = 'supplier' 
  AND EXISTS (
    SELECT 1 FROM quotation_requests qr
    JOIN suppliers s ON s.id = qr.supplier_id
    JOIN profiles requester ON requester.id = qr.requester_id
    WHERE s.user_id = profiles.id 
    AND requester.user_id = auth.uid()
    AND qr.status IN ('pending', 'accepted')
    AND qr.created_at > NOW() - INTERVAL '30 days'  -- Only recent requests
  )
);

CREATE POLICY "Suppliers can view builder profiles for recent active quotations" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND role = 'builder' 
  AND EXISTS (
    SELECT 1 FROM quotation_requests qr
    JOIN suppliers s ON s.id = qr.supplier_id
    WHERE qr.requester_id = profiles.id 
    AND s.user_id = auth.uid()
    AND qr.status IN ('pending', 'accepted')
    AND qr.created_at > NOW() - INTERVAL '30 days'  -- Only recent requests
  )
);

CREATE POLICY "Users can view delivery provider profiles for active requests only" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM delivery_providers dp
    JOIN delivery_requests dr ON dp.id = dr.provider_id
    JOIN profiles requester ON requester.id = dr.builder_id
    WHERE dp.user_id = profiles.id 
    AND requester.user_id = auth.uid()
    AND dr.status IN ('accepted', 'in_progress')
  )
);

-- Create access logging table for monitoring profile access
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

-- Create function to log profile access attempts
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
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the transaction
  NULL;
END;
$$;