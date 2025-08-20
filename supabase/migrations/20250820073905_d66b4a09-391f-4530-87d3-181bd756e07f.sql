-- Fix security warning by updating function search path
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- Fix security warning by updating function search path  
ALTER FUNCTION public.generate_tracking_number() SET search_path = public;