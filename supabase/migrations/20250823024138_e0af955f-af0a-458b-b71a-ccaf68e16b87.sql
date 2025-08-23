-- Create delivery tracking table for real-time location updates
CREATE TABLE delivery_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_request_id uuid NOT NULL REFERENCES delivery_requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES delivery_providers(id),
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  heading numeric,
  speed numeric,
  accuracy numeric,
  status text NOT NULL DEFAULT 'en_route',
  estimated_arrival timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_delivery_tracking_request ON delivery_tracking(delivery_request_id);
CREATE INDEX idx_delivery_tracking_provider ON delivery_tracking(provider_id);
CREATE INDEX idx_delivery_tracking_created_at ON delivery_tracking(created_at);

-- Enable RLS
ALTER TABLE delivery_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for delivery tracking
CREATE POLICY "Providers can manage their tracking data" 
ON delivery_tracking 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM delivery_providers dp 
    JOIN profiles p ON p.id = dp.user_id 
    WHERE p.user_id = auth.uid() AND dp.id = delivery_tracking.provider_id
  )
);

CREATE POLICY "Users can view relevant tracking data" 
ON delivery_tracking 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM delivery_requests dr
    JOIN profiles p ON p.user_id = auth.uid()
    LEFT JOIN delivery_providers dp ON dp.user_id = p.id
    WHERE dr.id = delivery_tracking.delivery_request_id 
    AND (p.role = 'admin' OR p.id = dr.builder_id OR dp.id = delivery_tracking.provider_id)
  )
);

-- Enable realtime for delivery tracking
ALTER PUBLICATION supabase_realtime ADD TABLE delivery_tracking;