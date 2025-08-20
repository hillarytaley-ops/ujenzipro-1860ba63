-- Create delivery_providers table for service providers
CREATE TABLE public.delivery_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  provider_type TEXT NOT NULL DEFAULT 'individual', -- 'individual' or 'organization'
  contact_person TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  vehicle_types TEXT[] DEFAULT ARRAY[]::TEXT[],
  service_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  capacity_kg NUMERIC,
  hourly_rate NUMERIC,
  per_km_rate NUMERIC,
  availability_schedule JSONB,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_requests table for builders to request services
CREATE TABLE public.delivery_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  builder_id UUID NOT NULL,
  provider_id UUID,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  material_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  weight_kg NUMERIC,
  pickup_date DATE NOT NULL,
  preferred_time TIME,
  special_instructions TEXT,
  budget_range TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'assigned', 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_providers
CREATE POLICY "Users can view all delivery providers" 
ON public.delivery_providers 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own provider profile" 
ON public.delivery_providers 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = delivery_providers.user_id
  )
);

CREATE POLICY "Users can update their own provider profile" 
ON public.delivery_providers 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = delivery_providers.user_id
  )
);

-- RLS Policies for delivery_requests
CREATE POLICY "Users can view relevant delivery requests" 
ON public.delivery_requests 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN delivery_providers dp ON dp.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' 
      OR p.id = delivery_requests.builder_id 
      OR dp.id = delivery_requests.provider_id
    )
  )
);

CREATE POLICY "Builders can create delivery requests" 
ON public.delivery_requests 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = delivery_requests.builder_id
  )
);

CREATE POLICY "Users can update relevant delivery requests" 
ON public.delivery_requests 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN delivery_providers dp ON dp.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' 
      OR p.id = delivery_requests.builder_id 
      OR dp.id = delivery_requests.provider_id
    )
  )
);

-- Create triggers for timestamps
CREATE TRIGGER update_delivery_providers_updated_at
BEFORE UPDATE ON public.delivery_providers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_requests_updated_at
BEFORE UPDATE ON public.delivery_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();