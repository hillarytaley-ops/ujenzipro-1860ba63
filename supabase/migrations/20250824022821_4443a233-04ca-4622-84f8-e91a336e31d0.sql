-- Drop the overly permissive policy that allows anyone to read all suppliers
DROP POLICY IF EXISTS "Users can view all suppliers" ON public.suppliers;

-- Allow suppliers to view their own information
CREATE POLICY "Suppliers can view their own info" 
ON public.suppliers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND id = suppliers.user_id
  )
);

-- Allow builders/requesters to view suppliers they have quotation requests with
CREATE POLICY "Builders can view suppliers from their quotation requests" 
ON public.suppliers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.quotation_requests qr
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE qr.supplier_id = suppliers.id 
    AND p.id = qr.requester_id
  )
);

-- Allow buyers to view suppliers from their purchase orders
CREATE POLICY "Buyers can view suppliers from their purchase orders" 
ON public.suppliers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.purchase_orders po
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE po.supplier_id = suppliers.id 
    AND p.id = po.buyer_id
  )
);

-- Allow builders to view suppliers from their delivery relationships
CREATE POLICY "Builders can view suppliers from deliveries" 
ON public.suppliers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.deliveries d
    JOIN public.profiles p ON p.user_id = auth.uid()
    WHERE d.supplier_id = suppliers.id 
    AND p.id = d.builder_id
  )
);

-- Allow admins to view all suppliers for management
CREATE POLICY "Admins can view all suppliers" 
ON public.suppliers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow authenticated users to view basic supplier info for discovery (without sensitive contact details)
-- This is handled at the application level by only showing limited fields
CREATE POLICY "Authenticated users can discover suppliers" 
ON public.suppliers 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL
);