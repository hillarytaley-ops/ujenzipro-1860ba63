-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create more secure policies for profile access
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow admins to view all profiles for management purposes
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow builders to view supplier profiles they're working with
CREATE POLICY "Builders can view relevant supplier profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  role = 'supplier' AND
  EXISTS (
    SELECT 1 FROM public.suppliers s
    JOIN public.quotation_requests qr ON s.id = qr.supplier_id
    JOIN public.profiles requester ON requester.id = qr.requester_id
    WHERE s.user_id = profiles.id AND requester.user_id = auth.uid()
  )
);

-- Allow suppliers to view builder profiles they're working with
CREATE POLICY "Suppliers can view relevant builder profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  role = 'builder' AND
  EXISTS (
    SELECT 1 FROM public.suppliers s
    JOIN public.quotation_requests qr ON s.id = qr.supplier_id
    WHERE qr.requester_id = profiles.id AND s.user_id = auth.uid()
  )
);

-- Allow viewing delivery provider profiles for delivery-related interactions
CREATE POLICY "Users can view delivery provider profiles for active requests" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.delivery_providers dp
    JOIN public.delivery_requests dr ON dp.id = dr.provider_id
    JOIN public.profiles requester ON requester.id = dr.builder_id
    WHERE dp.user_id = profiles.id AND requester.user_id = auth.uid()
  )
);