-- Create delivery notes table for suppliers to upload when dispatching orders
CREATE TABLE public.delivery_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  delivery_note_number TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  dispatch_date DATE NOT NULL,
  expected_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_notes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Suppliers can insert delivery notes for their orders"
ON public.delivery_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM purchase_orders po
    JOIN suppliers s ON s.id = po.supplier_id
    JOIN profiles p ON p.id = s.user_id
    WHERE po.id = delivery_notes.purchase_order_id 
    AND s.id = delivery_notes.supplier_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Suppliers can update their delivery notes"
ON public.delivery_notes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM suppliers s
    JOIN profiles p ON p.id = s.user_id
    WHERE s.id = delivery_notes.supplier_id
    AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Relevant users can view delivery notes"
ON public.delivery_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM purchase_orders po
    JOIN profiles p ON p.user_id = auth.uid()
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE po.id = delivery_notes.purchase_order_id
    AND (
      p.role = 'admin'::text OR
      p.id = po.buyer_id OR
      s.id = delivery_notes.supplier_id
    )
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_delivery_notes_updated_at
  BEFORE UPDATE ON public.delivery_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for delivery notes if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('delivery-notes', 'delivery-notes', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for delivery notes
CREATE POLICY "Suppliers can upload delivery notes"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'delivery-notes' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Relevant users can view delivery notes"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'delivery-notes' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Suppliers can update their delivery notes"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'delivery-notes' AND
  auth.uid() IS NOT NULL
);