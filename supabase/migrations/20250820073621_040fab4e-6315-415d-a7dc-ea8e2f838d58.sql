-- Create storage bucket for receipts
INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);

-- Create table for receipt uploads
CREATE TABLE public.receipt_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id),
  delivery_id UUID REFERENCES public.deliveries(id),
  scanned_supply_id UUID REFERENCES public.scanned_supplies(id),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  content_type TEXT,
  uploaded_by UUID REFERENCES auth.users,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shared_with_builder BOOLEAN DEFAULT false,
  receipt_type TEXT DEFAULT 'purchase' CHECK (receipt_type IN ('purchase', 'delivery', 'quality_cert', 'other')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on receipt_uploads
ALTER TABLE public.receipt_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for receipt_uploads
CREATE POLICY "Suppliers can manage their receipts" 
  ON public.receipt_uploads 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      JOIN profiles p ON p.id = s.user_id 
      WHERE p.user_id = auth.uid() AND s.id = receipt_uploads.supplier_id
    )
  );

CREATE POLICY "Builders can view shared receipts" 
  ON public.receipt_uploads 
  FOR SELECT 
  USING (
    shared_with_builder = true AND (
      EXISTS (
        SELECT 1 FROM deliveries d 
        JOIN profiles p ON p.id = d.builder_id 
        WHERE p.user_id = auth.uid() AND d.id = receipt_uploads.delivery_id
      ) OR
      EXISTS (
        SELECT 1 FROM profiles p 
        WHERE p.user_id = auth.uid() AND p.role = 'admin'
      )
    )
  );

CREATE POLICY "Admins can view all receipts" 
  ON public.receipt_uploads 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Storage policies for receipts bucket
CREATE POLICY "Suppliers can upload receipts" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'receipts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Suppliers can view their receipts" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'receipts' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Builders can view shared receipts" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'receipts' AND 
    EXISTS (
      SELECT 1 FROM receipt_uploads ru 
      JOIN deliveries d ON d.id = ru.delivery_id 
      JOIN profiles p ON p.id = d.builder_id 
      WHERE p.user_id = auth.uid() 
      AND ru.file_path = name 
      AND ru.shared_with_builder = true
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_receipt_uploads_supplier_id ON public.receipt_uploads(supplier_id);
CREATE INDEX idx_receipt_uploads_delivery_id ON public.receipt_uploads(delivery_id);
CREATE INDEX idx_receipt_uploads_scanned_supply_id ON public.receipt_uploads(scanned_supply_id);
CREATE INDEX idx_receipt_uploads_shared ON public.receipt_uploads(shared_with_builder);

-- Create trigger for updating timestamps
CREATE TRIGGER update_receipt_uploads_updated_at
  BEFORE UPDATE ON public.receipt_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();