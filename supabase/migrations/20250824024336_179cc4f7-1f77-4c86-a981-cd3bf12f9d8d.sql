-- Create a separate table for public provider discovery that only contains non-sensitive information
CREATE TABLE IF NOT EXISTS public.delivery_providers_public (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID NOT NULL REFERENCES public.delivery_providers(id) ON DELETE CASCADE,
    provider_name TEXT NOT NULL,
    provider_type TEXT NOT NULL DEFAULT 'individual',
    vehicle_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    service_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
    capacity_kg NUMERIC,
    hourly_rate NUMERIC,
    per_km_rate NUMERIC,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on the public discovery table
ALTER TABLE public.delivery_providers_public ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view the public discovery information
CREATE POLICY "Authenticated users can discover public provider info" 
ON public.delivery_providers_public 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true AND is_verified = true);

-- Create trigger to sync data from main table to public table
CREATE OR REPLACE FUNCTION sync_delivery_provider_public()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update the public record
    INSERT INTO public.delivery_providers_public (
        provider_id,
        provider_name,
        provider_type,
        vehicle_types,
        service_areas,
        capacity_kg,
        hourly_rate,
        per_km_rate,
        is_verified,
        is_active,
        rating,
        total_deliveries,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.provider_name,
        NEW.provider_type,
        NEW.vehicle_types,
        NEW.service_areas,
        NEW.capacity_kg,
        NEW.hourly_rate,
        NEW.per_km_rate,
        NEW.is_verified,
        NEW.is_active,
        NEW.rating,
        NEW.total_deliveries,
        now()
    )
    ON CONFLICT (provider_id) 
    DO UPDATE SET
        provider_name = NEW.provider_name,
        provider_type = NEW.provider_type,
        vehicle_types = NEW.vehicle_types,
        service_areas = NEW.service_areas,
        capacity_kg = NEW.capacity_kg,
        hourly_rate = NEW.hourly_rate,
        per_km_rate = NEW.per_km_rate,
        is_verified = NEW.is_verified,
        is_active = NEW.is_active,
        rating = NEW.rating,
        total_deliveries = NEW.total_deliveries,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER sync_delivery_provider_public_trigger
    AFTER INSERT OR UPDATE ON public.delivery_providers
    FOR EACH ROW
    EXECUTE FUNCTION sync_delivery_provider_public();

-- Handle deletions
CREATE OR REPLACE FUNCTION delete_delivery_provider_public()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.delivery_providers_public WHERE provider_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER delete_delivery_provider_public_trigger
    AFTER DELETE ON public.delivery_providers
    FOR EACH ROW
    EXECUTE FUNCTION delete_delivery_provider_public();

-- Add unique constraint to prevent duplicate provider_id entries
ALTER TABLE public.delivery_providers_public 
ADD CONSTRAINT delivery_providers_public_provider_id_unique UNIQUE (provider_id);

-- Populate the table with existing data
INSERT INTO public.delivery_providers_public (
    provider_id,
    provider_name,
    provider_type,
    vehicle_types,
    service_areas,
    capacity_kg,
    hourly_rate,
    per_km_rate,
    is_verified,
    is_active,
    rating,
    total_deliveries
)
SELECT 
    id,
    provider_name,
    provider_type,
    vehicle_types,
    service_areas,
    capacity_kg,
    hourly_rate,
    per_km_rate,
    is_verified,
    is_active,
    rating,
    total_deliveries
FROM public.delivery_providers
ON CONFLICT (provider_id) DO NOTHING;