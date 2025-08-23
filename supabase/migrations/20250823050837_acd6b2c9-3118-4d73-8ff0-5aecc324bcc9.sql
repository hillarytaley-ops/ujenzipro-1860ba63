-- Create delivery acknowledgements table for professional builders and companies
CREATE TABLE public.delivery_acknowledgements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_note_id UUID NOT NULL REFERENCES delivery_notes(id) ON DELETE CASCADE,
  acknowledged_by TEXT NOT NULL,
  acknowledger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  acknowledgement_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  digital_signature TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  comments TEXT,
  signed_document_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_acknowledgements ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery acknowledgements
CREATE POLICY "Professional builders and companies can create acknowledgements" 
ON public.delivery_acknowledgements 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = delivery_acknowledgements.acknowledger_id
    AND profiles.role = 'builder' 
    AND (profiles.user_type = 'company' OR profiles.is_professional = true)
  )
);

CREATE POLICY "Professional builders and companies can view their acknowledgements" 
ON public.delivery_acknowledgements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (
      profiles.id = delivery_acknowledgements.acknowledger_id
      OR profiles.role = 'admin'
    )
  )
);

CREATE POLICY "Suppliers can view acknowledgements for their delivery notes" 
ON public.delivery_acknowledgements 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM delivery_notes dn
    JOIN suppliers s ON s.id = dn.supplier_id
    JOIN profiles p ON p.id = s.user_id
    WHERE p.user_id = auth.uid() 
    AND dn.id = delivery_acknowledgements.delivery_note_id
  )
);

CREATE POLICY "Users can update their own acknowledgements" 
ON public.delivery_acknowledgements 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = delivery_acknowledgements.acknowledger_id
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_delivery_acknowledgements_updated_at
BEFORE UPDATE ON public.delivery_acknowledgements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();