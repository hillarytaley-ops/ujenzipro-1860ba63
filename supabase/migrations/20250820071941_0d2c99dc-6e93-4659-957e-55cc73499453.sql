-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'builder', 'supplier', 'driver')) DEFAULT 'builder',
  phone TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_date DATE,
  end_date DATE,
  status TEXT CHECK (status IN ('planning', 'active', 'completed', 'paused')) DEFAULT 'planning',
  builder_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cameras table
CREATE TABLE public.cameras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  stream_url TEXT,
  project_id UUID REFERENCES public.projects(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  materials_offered TEXT[],
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create deliveries table
CREATE TABLE public.deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_number TEXT UNIQUE,
  supplier_id UUID REFERENCES public.suppliers(id),
  builder_id UUID REFERENCES public.profiles(id),
  project_id UUID REFERENCES public.projects(id),
  material_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  weight_kg DECIMAL,
  pickup_address TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  pickup_date DATE,
  delivery_date DATE,
  estimated_delivery_time TIMESTAMP WITH TIME ZONE,
  actual_delivery_time TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('pending', 'pickup_scheduled', 'in_transit', 'delivered', 'cancelled')) DEFAULT 'pending',
  driver_name TEXT,
  driver_phone TEXT,
  vehicle_details TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery_updates table
CREATE TABLE public.delivery_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'pickup_scheduled', 'in_transit', 'delivered', 'cancelled')) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tracking_updates table
CREATE TABLE public.tracking_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delivery_id UUID REFERENCES public.deliveries(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'pickup_scheduled', 'in_transit', 'delivered', 'cancelled')) NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create feedback table
CREATE TABLE public.feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  delivery_id UUID REFERENCES public.deliveries(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  category TEXT CHECK (category IN ('delivery', 'quality', 'communication', 'other')) DEFAULT 'other',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for projects
CREATE POLICY "Users can view all projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Builders can manage their projects" ON public.projects FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (profiles.role = 'admin' OR profiles.id = projects.builder_id)
  )
);

-- Create RLS policies for cameras
CREATE POLICY "Users can view all cameras" ON public.cameras FOR SELECT USING (true);
CREATE POLICY "Admins and builders can manage cameras" ON public.cameras FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role IN ('admin', 'builder')
  )
);

-- Create RLS policies for suppliers
CREATE POLICY "Users can view all suppliers" ON public.suppliers FOR SELECT USING (true);
CREATE POLICY "Suppliers can update their own info" ON public.suppliers FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = suppliers.user_id
  )
);
CREATE POLICY "Users can insert supplier info" ON public.suppliers FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = suppliers.user_id
  )
);

-- Create RLS policies for deliveries
CREATE POLICY "Users can view relevant deliveries" ON public.deliveries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' OR
      p.id = deliveries.builder_id OR
      s.id = deliveries.supplier_id
    )
  )
);

CREATE POLICY "Builders and suppliers can manage deliveries" ON public.deliveries FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    LEFT JOIN public.suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' OR
      p.id = deliveries.builder_id OR
      s.id = deliveries.supplier_id
    )
  )
);

-- Create RLS policies for delivery_updates
CREATE POLICY "Users can view relevant delivery updates" ON public.delivery_updates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.deliveries d
    JOIN public.profiles p ON (p.user_id = auth.uid())
    LEFT JOIN public.suppliers s ON s.user_id = p.id
    WHERE d.id = delivery_updates.delivery_id
    AND (
      p.role = 'admin' OR
      p.id = d.builder_id OR
      s.id = d.supplier_id
    )
  )
);

CREATE POLICY "Users can manage relevant delivery updates" ON public.delivery_updates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.deliveries d
    JOIN public.profiles p ON (p.user_id = auth.uid())
    LEFT JOIN public.suppliers s ON s.user_id = p.id
    WHERE d.id = delivery_updates.delivery_id
    AND (
      p.role = 'admin' OR
      p.id = d.builder_id OR
      s.id = d.supplier_id
    )
  )
);

-- Create RLS policies for tracking_updates  
CREATE POLICY "Users can view relevant tracking updates" ON public.tracking_updates FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.deliveries d
    JOIN public.profiles p ON (p.user_id = auth.uid())
    LEFT JOIN public.suppliers s ON s.user_id = p.id
    WHERE d.id = tracking_updates.delivery_id
    AND (
      p.role = 'admin' OR
      p.id = d.builder_id OR
      s.id = d.supplier_id
    )
  )
);

CREATE POLICY "Users can manage relevant tracking updates" ON public.tracking_updates FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.deliveries d
    JOIN public.profiles p ON (p.user_id = auth.uid())
    LEFT JOIN public.suppliers s ON s.user_id = p.id
    WHERE d.id = tracking_updates.delivery_id
    AND (
      p.role = 'admin' OR
      p.id = d.builder_id OR
      s.id = d.supplier_id
    )
  )
);

-- Create RLS policies for feedback
CREATE POLICY "Users can view all feedback" ON public.feedback FOR SELECT USING (true);
CREATE POLICY "Users can create feedback" ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own feedback" ON public.feedback FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON public.cameras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate tracking numbers for deliveries
CREATE OR REPLACE FUNCTION public.generate_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := 'JG' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(nextval('tracking_number_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create sequence for tracking numbers
CREATE SEQUENCE IF NOT EXISTS tracking_number_seq START 1;

-- Create trigger for tracking number generation
CREATE TRIGGER generate_delivery_tracking_number 
  BEFORE INSERT ON public.deliveries 
  FOR EACH ROW 
  EXECUTE FUNCTION public.generate_tracking_number();