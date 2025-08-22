-- Create quotation_requests table
CREATE TABLE public.quotation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  material_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pieces',
  project_description TEXT,
  delivery_address TEXT NOT NULL,
  preferred_delivery_date DATE,
  special_requirements TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'quoted', 'accepted', 'rejected', 'expired')),
  quote_amount DECIMAL,
  quote_valid_until DATE,
  supplier_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quotation_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for quotation requests
CREATE POLICY "Users can create quotation requests"
ON public.quotation_requests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = quotation_requests.requester_id
  )
);

CREATE POLICY "Users can view their quotation requests"
ON public.quotation_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' 
      OR p.id = quotation_requests.requester_id 
      OR s.id = quotation_requests.supplier_id
    )
  )
);

CREATE POLICY "Suppliers can update their quotation requests"
ON public.quotation_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' 
      OR s.id = quotation_requests.supplier_id
    )
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_quotation_requests_updated_at
BEFORE UPDATE ON public.quotation_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();