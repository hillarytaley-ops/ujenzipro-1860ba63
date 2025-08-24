-- Drop the dangerous policy that allows anyone to manipulate delivery status updates
DROP POLICY IF EXISTS "Allow all operations on delivery_status_updates" ON public.delivery_status_updates;

-- Allow users to view status updates for relevant delivery requests
CREATE POLICY "Users can view relevant delivery status updates" 
ON public.delivery_status_updates 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.delivery_requests dr
    JOIN public.profiles p ON p.user_id = auth.uid()
    LEFT JOIN public.delivery_providers dp ON dp.user_id = p.id
    WHERE dr.id = delivery_status_updates.delivery_request_id 
    AND (
      p.role = 'admin' OR 
      p.id = dr.builder_id OR 
      dp.id = dr.provider_id
    )
  )
);

-- Allow providers to create status updates for their own delivery requests
CREATE POLICY "Providers can create status updates for their deliveries" 
ON public.delivery_status_updates 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.delivery_requests dr
    JOIN public.delivery_providers dp ON dp.id = dr.provider_id
    JOIN public.profiles p ON p.id = dp.user_id
    WHERE dr.id = delivery_status_updates.delivery_request_id 
    AND p.user_id = auth.uid()
    AND delivery_status_updates.updated_by_id = auth.uid()::text
  )
);

-- Allow providers to update their own status updates
CREATE POLICY "Providers can update their own status updates" 
ON public.delivery_status_updates 
FOR UPDATE 
USING (
  auth.uid() IS NOT NULL AND
  delivery_status_updates.updated_by_id = auth.uid()::text
);

-- Allow admins to manage all status updates
CREATE POLICY "Admins can manage all delivery status updates" 
ON public.delivery_status_updates 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);