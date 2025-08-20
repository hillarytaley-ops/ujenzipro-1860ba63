-- Fix function search path security warnings by setting search_path for existing functions
CREATE OR REPLACE FUNCTION public.generate_access_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.set_project_access_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.access_code IS NULL THEN
    NEW.access_code := public.generate_access_code();
  END IF;
  RETURN NEW;
END;
$$;