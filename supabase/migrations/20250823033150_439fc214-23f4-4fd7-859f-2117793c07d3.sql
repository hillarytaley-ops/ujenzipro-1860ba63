-- Add coordinate fields to delivery_requests table for location pinning
ALTER TABLE delivery_requests 
ADD COLUMN pickup_latitude DECIMAL(10, 8),
ADD COLUMN pickup_longitude DECIMAL(11, 8),
ADD COLUMN delivery_latitude DECIMAL(10, 8),
ADD COLUMN delivery_longitude DECIMAL(11, 8);

-- Add comments for clarity
COMMENT ON COLUMN delivery_requests.pickup_latitude IS 'Latitude coordinate for pickup location when pinned on map';
COMMENT ON COLUMN delivery_requests.pickup_longitude IS 'Longitude coordinate for pickup location when pinned on map';
COMMENT ON COLUMN delivery_requests.delivery_latitude IS 'Latitude coordinate for delivery location when pinned on map';
COMMENT ON COLUMN delivery_requests.delivery_longitude IS 'Longitude coordinate for delivery location when pinned on map';