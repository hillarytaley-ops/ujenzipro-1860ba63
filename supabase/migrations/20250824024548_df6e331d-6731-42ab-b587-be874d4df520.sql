-- Fix the search path security issue by setting explicit search paths for the functions
CREATE OR REPLACE FUNCTION sync_delivery_provider_public()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

CREATE OR REPLACE FUNCTION delete_delivery_provider_public()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.delivery_providers_public WHERE provider_id = OLD.id;
    RETURN OLD;
END;
$$;