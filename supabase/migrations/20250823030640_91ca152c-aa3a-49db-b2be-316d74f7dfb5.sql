-- Add required_vehicle_type field to delivery_requests table
ALTER TABLE delivery_requests 
ADD COLUMN required_vehicle_type text;