-- Create storage bucket for driving license documents
INSERT INTO storage.buckets (id, name, public) VALUES ('driving-licenses', 'driving-licenses', false)
ON CONFLICT (id) DO NOTHING;

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