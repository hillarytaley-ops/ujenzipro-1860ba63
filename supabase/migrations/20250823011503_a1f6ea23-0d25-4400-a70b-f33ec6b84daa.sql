-- Create goods_received_notes table
CREATE TABLE public.goods_received_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  grn_number TEXT NOT NULL UNIQUE,
  delivery_id UUID,
  supplier_name TEXT NOT NULL,
  builder_id UUID NOT NULL,
  project_id UUID,
  delivery_note_reference TEXT,
  received_date DATE NOT NULL,
  received_by TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  overall_condition TEXT NOT NULL DEFAULT 'good'::text,
  discrepancies TEXT,
  additional_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft'::text,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.goods_received_notes ENABLE ROW LEVEL SECURITY;

-- Create policies for goods_received_notes
CREATE POLICY "Builders can create their own GRNs" 
ON public.goods_received_notes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = goods_received_notes.builder_id 
    AND profiles.role = 'builder'
  )
);

CREATE POLICY "Builders can view their own GRNs" 
ON public.goods_received_notes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND (
      profiles.id = goods_received_notes.builder_id 
      OR profiles.role = 'admin'
    )
  )
);

CREATE POLICY "Builders can update their own GRNs" 
ON public.goods_received_notes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.id = goods_received_notes.builder_id 
    AND profiles.role = 'builder'
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_goods_received_notes_updated_at
BEFORE UPDATE ON public.goods_received_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();