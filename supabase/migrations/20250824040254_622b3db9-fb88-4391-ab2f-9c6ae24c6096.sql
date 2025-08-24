-- Fix critical security issue: Secure user personal information access

-- Clean up existing policies to start fresh
DO $$ 
BEGIN
    -- Drop projects policies
    DROP POLICY IF EXISTS "Users can view all projects" ON public.projects;
    DROP POLICY IF EXISTS "Users can view relevant projects only" ON public.projects;
    DROP POLICY IF EXISTS "Users can view projects with legitimate business relationships" ON public.projects;
    
    -- Drop profiles policies that need to be replaced
    DROP POLICY IF EXISTS "Builders can view relevant supplier profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Suppliers can view relevant builder profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view delivery provider profiles for active requests" ON public.profiles;
    DROP POLICY IF EXISTS "Builders can view supplier profiles for active business only" ON public.profiles;
    DROP POLICY IF EXISTS "Suppliers can view builder profiles for active business only" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view delivery provider profiles for confirmed requests only" ON public.profiles;
    DROP POLICY IF EXISTS "Builders can view supplier profiles for recent active quotations" ON public.profiles;
    DROP POLICY IF EXISTS "Suppliers can view builder profiles for recent active quotations" ON public.profiles;
    
    -- Drop existing access log policies if they exist
    DROP POLICY IF EXISTS "Admin can view profile access logs" ON public.profile_access_log;
    
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors for non-existent policies/tables
    NULL;
END $$;

-- Create secure projects policy
CREATE POLICY "Secure project access based on business relationships" ON public.projects
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles p 
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' 
      OR p.id = projects.builder_id
      OR EXISTS (
        SELECT 1 FROM suppliers s 
        JOIN deliveries d ON d.supplier_id = s.id
        WHERE s.user_id = p.id AND d.project_id = projects.id
      )
    )
  )
);

-- Create secure profile access policies with strict business relationship validation
CREATE POLICY "Secure supplier profile access for builders" ON public.profiles
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
    AND qr.created_at > NOW() - INTERVAL '30 days'
  )
);

CREATE POLICY "Secure builder profile access for suppliers" ON public.profiles
FOR SELECT USING (
  auth.uid() IS NOT NULL 
  AND role = 'builder' 
  AND EXISTS (
    SELECT 1 FROM quotation_requests qr
    JOIN suppliers s ON s.id = qr.supplier_id
    WHERE qr.requester_id = profiles.id 
    AND s.user_id = auth.uid()
    AND qr.status IN ('pending', 'accepted')
    AND qr.created_at > NOW() - INTERVAL '30 days'
  )
);

CREATE POLICY "Secure delivery provider profile access" ON public.profiles
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

-- Create profile access logging if table doesn't exist
CREATE TABLE IF NOT EXISTS profile_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viewer_user_id uuid,
  viewed_profile_id uuid,
  access_type text NOT NULL,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
    ALTER TABLE profile_access_log ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
    NULL; -- Table might already have RLS enabled
END $$;

-- Create access log policy
CREATE POLICY "Admins can view profile access logs" ON profile_access_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create secure profile access logging function
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
  NULL; -- Don't fail transaction on logging errors
END;
$$;