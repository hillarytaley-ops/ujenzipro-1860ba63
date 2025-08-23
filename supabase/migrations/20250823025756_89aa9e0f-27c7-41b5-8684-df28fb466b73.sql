-- Add driving license fields to delivery_providers table
ALTER TABLE delivery_providers 
ADD COLUMN driving_license_number text,
ADD COLUMN driving_license_expiry date,
ADD COLUMN driving_license_class text,
ADD COLUMN driving_license_document_path text,
ADD COLUMN driving_license_verified boolean DEFAULT false;

-- Create storage bucket for driving license documents
INSERT INTO storage.buckets (id, name, public) VALUES ('driving-licenses', 'driving-licenses', false);

-- Create RLS policies for driving license documents
CREATE POLICY "Users can upload their own driving license documents" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'driving-licenses' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own driving license documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'driving-licenses' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins can view all driving license documents" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'driving-licenses' AND EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can update their own driving license documents" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'driving-licenses' AND auth.uid()::text = (storage.foldername(name))[1]);