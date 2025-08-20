
-- Create table for scanned supplies (at supplier location)
CREATE TABLE public.scanned_supplies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES public.suppliers(id),
  qr_code TEXT NOT NULL,
  material_type TEXT NOT NULL,
  batch_number TEXT,
  quantity INTEGER,
  unit TEXT DEFAULT 'pieces',
  supplier_info TEXT,
  scanned_by UUID REFERENCES auth.users,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'dispatched')),
  notes TEXT
);

-- Create table for scanned receivables (at building site)
CREATE TABLE public.scanned_receivables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id),
  delivery_id UUID REFERENCES public.deliveries(id),
  qr_code TEXT NOT NULL,
  material_type TEXT NOT NULL,
  batch_number TEXT,
  quantity INTEGER,
  unit TEXT DEFAULT 'pieces',
  supplier_info TEXT,
  scanned_by UUID REFERENCES auth.users,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'damaged', 'partial')),
  verified BOOLEAN DEFAULT false,
  notes TEXT
);

-- Enable RLS on both tables
ALTER TABLE public.scanned_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scanned_receivables ENABLE ROW LEVEL SECURITY;

-- RLS policies for scanned_supplies
CREATE POLICY "Suppliers can manage their scanned supplies" 
  ON public.scanned_supplies 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s 
      JOIN profiles p ON p.id = s.user_id 
      WHERE p.user_id = auth.uid() AND s.id = scanned_supplies.supplier_id
    )
  );

CREATE POLICY "Users can view all scanned supplies" 
  ON public.scanned_supplies 
  FOR SELECT 
  USING (true);

-- RLS policies for scanned_receivables
CREATE POLICY "Project members can manage receivables" 
  ON public.scanned_receivables 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM projects pr 
      JOIN profiles p ON p.id = pr.builder_id 
      WHERE p.user_id = auth.uid() AND pr.id = scanned_receivables.project_id
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY "Users can view project receivables" 
  ON public.scanned_receivables 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM projects pr 
      JOIN profiles p ON p.id = pr.builder_id 
      WHERE p.user_id = auth.uid() AND pr.id = scanned_receivables.project_id
    ) OR
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_scanned_supplies_supplier_id ON public.scanned_supplies(supplier_id);
CREATE INDEX idx_scanned_supplies_qr_code ON public.scanned_supplies(qr_code);
CREATE INDEX idx_scanned_receivables_project_id ON public.scanned_receivables(project_id);
CREATE INDEX idx_scanned_receivables_delivery_id ON public.scanned_receivables(delivery_id);
CREATE INDEX idx_scanned_receivables_qr_code ON public.scanned_receivables(qr_code);
