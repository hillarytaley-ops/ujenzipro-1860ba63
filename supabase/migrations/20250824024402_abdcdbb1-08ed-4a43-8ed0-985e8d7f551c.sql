-- Create a separate table for public provider discovery information
-- This approach completely separates sensitive contact data from public discovery data
CREATE TABLE IF NOT EXISTS public.delivery_provider_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES public.delivery_providers(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'individual',
  vehicle_types TEXT[] DEFAULT '{}',
  service_areas TEXT[] DEFAULT '{}', 
  capacity_kg NUMERIC,
  hourly_rate NUMERIC,
  per_km_rate NUMERIC,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on the listings table
ALTER TABLE public.delivery_provider_listings ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view active verified provider listings for discovery
CREATE POLICY "Authenticated users can view provider listings" 
ON public.delivery_provider_listings 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND is_active = true 
  AND is_verified = true
);

-- Only providers can create/update their own listings
CREATE POLICY "Providers can manage their own listings" 
ON public.delivery_provider_listings 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.delivery_providers dp
    JOIN public.profiles p ON p.id = dp.user_id
    WHERE dp.id = delivery_provider_listings.provider_id 
    AND p.user_id = auth.uid()
  )
);

-- Create a function to sync basic info when delivery_providers table is updated
CREATE OR REPLACE FUNCTION sync_provider_listing()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    INSERT INTO public.delivery_provider_listings (
      provider_id, provider_name, provider_type, vehicle_types, 
      service_areas, capacity_kg, hourly_rate, per_km_rate,
      is_verified, is_active, rating, total_deliveries
    ) VALUES (
      NEW.id, NEW.provider_name, NEW.provider_type, NEW.vehicle_types,
      NEW.service_areas, NEW.capacity_kg, NEW.hourly_rate, NEW.per_km_rate,
      NEW.is_verified, NEW.is_active, NEW.rating, NEW.total_deliveries
    )
    ON CONFLICT (provider_id) DO UPDATE SET
      provider_name = EXCLUDED.provider_name,
      provider_type = EXCLUDED.provider_type,
      vehicle_types = EXCLUDED.vehicle_types,
      service_areas = EXCLUDED.service_areas,
      capacity_kg = EXCLUDED.capacity_kg,
      hourly_rate = EXCLUDED.hourly_rate,
      per_km_rate = EXCLUDED.per_km_rate,
      is_verified = EXCLUDED.is_verified,
      is_active = EXCLUDED.is_active,
      rating = EXCLUDED.rating,
      total_deliveries = EXCLUDED.total_deliveries,
      updated_at = now();
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    DELETE FROM public.delivery_provider_listings WHERE provider_id = OLD.id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically sync listings
CREATE TRIGGER sync_provider_listing_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.delivery_providers
  FOR EACH ROW EXECUTE FUNCTION sync_provider_listing();

-- Add unique constraint to prevent duplicate listings
ALTER TABLE public.delivery_provider_listings 
ADD CONSTRAINT unique_provider_listing UNIQUE (provider_id);

-- Migrate existing data to the listings table
INSERT INTO public.delivery_provider_listings (
  provider_id, provider_name, provider_type, vehicle_types, 
  service_areas, capacity_kg, hourly_rate, per_km_rate,
  is_verified, is_active, rating, total_deliveries
)
SELECT 
  id, provider_name, provider_type, vehicle_types,
  service_areas, capacity_kg, hourly_rate, per_km_rate,
  is_verified, is_active, rating, total_deliveries
FROM public.delivery_providers
WHERE is_active = true
ON CONFLICT (provider_id) DO NOTHING;