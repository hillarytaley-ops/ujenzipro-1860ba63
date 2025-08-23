-- Fix the security warning by setting search_path for the function
DROP FUNCTION IF EXISTS public.can_access_grn(UUID);

CREATE OR REPLACE FUNCTION public.can_access_grn(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = user_uuid 
    AND (
      role = 'admin' OR 
      (role = 'builder' AND (user_type = 'company' OR is_professional = true))
    )
  );
$$;