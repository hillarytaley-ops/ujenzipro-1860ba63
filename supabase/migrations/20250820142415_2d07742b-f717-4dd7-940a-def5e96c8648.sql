-- Add security code field to projects table
ALTER TABLE public.projects 
ADD COLUMN access_code TEXT;

-- Create function to generate random 6-digit access codes
CREATE OR REPLACE FUNCTION public.generate_access_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
END;
$$;

-- Add trigger to auto-generate access codes for new projects
CREATE OR REPLACE FUNCTION public.set_project_access_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.access_code IS NULL THEN
    NEW.access_code := public.generate_access_code();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_project_access_code_trigger
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_project_access_code();