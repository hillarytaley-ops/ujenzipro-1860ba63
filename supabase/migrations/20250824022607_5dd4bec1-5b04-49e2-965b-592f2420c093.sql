-- Drop the overly permissive policy that allows anyone to read all communications
DROP POLICY IF EXISTS "Allow all operations on delivery_communications" ON public.delivery_communications;

-- Allow users to view their own communications (as sender)
CREATE POLICY "Users can view their own communications" 
ON public.delivery_communications 
FOR SELECT 
USING (
  auth.uid()::text = sender_id
);

-- Allow users to view communications for delivery requests they're involved in
CREATE POLICY "Users can view communications for their delivery requests" 
ON public.delivery_communications 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.delivery_requests dr
    JOIN public.profiles p ON p.user_id = auth.uid()
    LEFT JOIN public.delivery_providers dp ON dp.user_id = p.id
    WHERE dr.id = delivery_communications.delivery_request_id 
    AND (
      p.id = dr.builder_id OR 
      dp.id = dr.provider_id OR
      p.role = 'admin'
    )
  )
);

-- Allow users to create communications for delivery requests they're involved in
CREATE POLICY "Users can create communications for their delivery requests" 
ON public.delivery_communications 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  auth.uid()::text = sender_id AND
  EXISTS (
    SELECT 1 FROM public.delivery_requests dr
    JOIN public.profiles p ON p.user_id = auth.uid()
    LEFT JOIN public.delivery_providers dp ON dp.user_id = p.id
    WHERE dr.id = delivery_communications.delivery_request_id 
    AND (
      p.id = dr.builder_id OR 
      dp.id = dr.provider_id OR
      p.role = 'admin'
    )
  )
);

-- Allow users to update their own communications
CREATE POLICY "Users can update their own communications" 
ON public.delivery_communications 
FOR UPDATE 
USING (
  auth.uid()::text = sender_id
)
WITH CHECK (
  auth.uid()::text = sender_id
);

-- Allow admins to view all communications for management purposes
CREATE POLICY "Admins can view all communications" 
ON public.delivery_communications 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to manage all communications
CREATE POLICY "Admins can manage all communications" 
ON public.delivery_communications 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);