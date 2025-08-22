-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  quotation_request_id UUID,
  total_amount DECIMAL NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  payment_terms TEXT,
  special_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'delivered', 'cancelled')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sequence for PO numbers
CREATE SEQUENCE po_number_seq START 1000;

-- Function to generate PO number
CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
    NEW.po_number := 'PO' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('po_number_seq')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for PO number generation
CREATE TRIGGER generate_po_number_trigger
BEFORE INSERT ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_po_number();

-- Enable RLS
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for purchase orders
CREATE POLICY "Buyers can create purchase orders"
ON public.purchase_orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = purchase_orders.buyer_id
    AND profiles.role = 'builder'
  )
);

CREATE POLICY "Users can view relevant purchase orders"
ON public.purchase_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' 
      OR p.id = purchase_orders.buyer_id 
      OR s.id = purchase_orders.supplier_id
    )
  )
);

CREATE POLICY "Suppliers can update purchase order status"
ON public.purchase_orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' 
      OR s.id = purchase_orders.supplier_id
    )
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_purchase_orders_updated_at
BEFORE UPDATE ON public.purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();