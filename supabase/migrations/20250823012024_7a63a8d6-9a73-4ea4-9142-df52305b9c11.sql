-- Add user type and company status to profiles
ALTER TABLE public.profiles 
ADD COLUMN user_type TEXT DEFAULT 'individual'::text,
ADD COLUMN is_professional BOOLEAN DEFAULT false,
ADD COLUMN company_registration TEXT,
ADD COLUMN business_license TEXT;

-- Update RLS policies for goods_received_notes to restrict to companies and professional builders
DROP POLICY IF EXISTS "Builders can create their own GRNs" ON public.goods_received_notes;
DROP POLICY IF EXISTS "Builders can view their own GRNs" ON public.goods_received_notes;
DROP POLICY IF EXISTS "Builders can update their own GRNs" ON public.goods_received_notes;

-- Create new policies that only allow companies and professional builders
CREATE POLICY "Professional builders and companies can create GRNs" 
ON public.goods_received_notes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = goods_received_notes.builder_id 
    AND profiles.role = 'builder'
    AND (profiles.user_type = 'company' OR profiles.is_professional = true)
  )
);

CREATE POLICY "Professional builders and companies can view their own GRNs" 
ON public.goods_received_notes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (
      (profiles.id = goods_received_notes.builder_id 
       AND profiles.role = 'builder'
       AND (profiles.user_type = 'company' OR profiles.is_professional = true))
      OR profiles.role = 'admin'
    )
  )
);

CREATE POLICY "Professional builders and companies can update their own GRNs" 
ON public.goods_received_notes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = goods_received_notes.builder_id 
    AND profiles.role = 'builder'
    AND (profiles.user_type = 'company' OR profiles.is_professional = true)
  )
);

-- Create helper function to check if user can access GRN
CREATE OR REPLACE FUNCTION public.can_access_grn(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
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