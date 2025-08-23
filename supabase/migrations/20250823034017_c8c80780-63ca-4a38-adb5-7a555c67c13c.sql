-- Create communication system tables
CREATE TABLE public.delivery_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_request_id UUID REFERENCES delivery_requests(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('supplier', 'delivery_provider', 'builder')),
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'status_update', 'location_update', 'voice_note', 'image')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  read_by JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery status tracking table
CREATE TABLE public.delivery_status_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_request_id UUID REFERENCES delivery_requests(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),
  notes TEXT,
  updated_by_type TEXT NOT NULL CHECK (updated_by_type IN ('supplier', 'delivery_provider', 'builder')),
  updated_by_id TEXT NOT NULL,
  updated_by_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_status_updates ENABLE ROW LEVEL SECURITY;

-- Create policies for open access (since no auth is implemented)
CREATE POLICY "Allow all operations on delivery_communications" 
ON public.delivery_communications 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all operations on delivery_status_updates" 
ON public.delivery_status_updates 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX idx_delivery_communications_request_id ON public.delivery_communications(delivery_request_id);
CREATE INDEX idx_delivery_communications_created_at ON public.delivery_communications(created_at DESC);
CREATE INDEX idx_delivery_status_updates_request_id ON public.delivery_status_updates(delivery_request_id);
CREATE INDEX idx_delivery_status_updates_created_at ON public.delivery_status_updates(created_at DESC);

-- Add to realtime publication for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_communications;
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_status_updates;

-- Set replica identity for realtime
ALTER TABLE public.delivery_communications REPLICA IDENTITY FULL;
ALTER TABLE public.delivery_status_updates REPLICA IDENTITY FULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_delivery_communications_updated_at
BEFORE UPDATE ON public.delivery_communications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();