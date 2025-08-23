-- Drop and recreate function with proper search path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Recreate the trigger for delivery_communications only (others will be recreated automatically)
CREATE TRIGGER update_delivery_communications_updated_at
BEFORE UPDATE ON public.delivery_communications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();