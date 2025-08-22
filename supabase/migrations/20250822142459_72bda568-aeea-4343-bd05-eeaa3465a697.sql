-- Create a storage bucket for QR codes
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-codes', 'qr-codes', true);

-- Create storage policies for QR codes
CREATE POLICY "QR codes are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'qr-codes');

CREATE POLICY "Suppliers can upload QR codes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'qr-codes');

-- Add QR code fields to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN qr_code_url TEXT,
ADD COLUMN qr_code_generated BOOLEAN DEFAULT FALSE;