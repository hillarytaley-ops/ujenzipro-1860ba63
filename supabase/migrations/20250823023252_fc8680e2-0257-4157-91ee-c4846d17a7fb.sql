-- Fix the foreign key relationship for delivery_requests
-- Add foreign key constraint for builder_id to profiles table
ALTER TABLE delivery_requests 
ADD CONSTRAINT delivery_requests_builder_id_fkey 
FOREIGN KEY (builder_id) REFERENCES profiles(id);

-- Add provider_response column to track accept/reject status
ALTER TABLE delivery_requests 
ADD COLUMN provider_response text DEFAULT NULL,
ADD COLUMN response_date timestamp with time zone DEFAULT NULL,
ADD COLUMN response_notes text DEFAULT NULL;

-- Update delivery_requests status to include more states
UPDATE delivery_requests SET status = 'pending' WHERE status IS NULL;

-- Create an index for better performance
CREATE INDEX idx_delivery_requests_status ON delivery_requests(status);
CREATE INDEX idx_delivery_requests_provider ON delivery_requests(provider_id);