-- Fix the function search path mutable warning by setting a stable search_path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';