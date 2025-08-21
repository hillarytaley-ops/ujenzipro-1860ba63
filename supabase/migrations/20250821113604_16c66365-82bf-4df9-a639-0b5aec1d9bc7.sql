-- Create delivery_orders table for managing orders before dispatch
CREATE TABLE public.delivery_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  builder_id UUID NOT NULL,
  supplier_id UUID NOT NULL,
  project_id UUID,
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending_qr_coding',
  total_items INTEGER NOT NULL DEFAULT 0,
  qr_coded_items INTEGER NOT NULL DEFAULT 0,
  materials JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_address TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_materials table for individual materials in orders
CREATE TABLE public.order_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit TEXT NOT NULL DEFAULT 'pieces',
  qr_code TEXT,
  is_qr_coded BOOLEAN NOT NULL DEFAULT false,
  is_scanned BOOLEAN NOT NULL DEFAULT false,
  batch_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for delivery_orders
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for delivery_orders
CREATE POLICY "Builders can create orders"
ON public.delivery_orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE user_id = auth.uid() AND id = builder_id
  )
);

CREATE POLICY "Users can view relevant orders"
ON public.delivery_orders
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() AND (
      p.role = 'admin' OR
      p.id = delivery_orders.builder_id OR
      s.id = delivery_orders.supplier_id
    )
  )
);

CREATE POLICY "Suppliers can update their orders"
ON public.delivery_orders
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE p.user_id = auth.uid() AND (
      p.role = 'admin' OR
      s.id = delivery_orders.supplier_id
    )
  )
);

-- Enable RLS for order_materials
ALTER TABLE public.order_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for order_materials
CREATE POLICY "Users can view relevant order materials"
ON public.order_materials
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM delivery_orders 
    JOIN profiles p ON p.user_id = auth.uid()
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE delivery_orders.id = order_materials.order_id AND (
      p.role = 'admin' OR
      p.id = delivery_orders.builder_id OR
      s.id = delivery_orders.supplier_id
    )
  )
);

CREATE POLICY "Suppliers can manage order materials"
ON public.order_materials
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM delivery_orders 
    JOIN profiles p ON p.user_id = auth.uid()
    LEFT JOIN suppliers s ON s.user_id = p.id
    WHERE delivery_orders.id = order_materials.order_id AND (
      p.role = 'admin' OR
      s.id = delivery_orders.supplier_id
    )
  )
);

-- Create trigger to update timestamps
CREATE TRIGGER update_delivery_orders_updated_at
BEFORE UPDATE ON public.delivery_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_materials_updated_at
BEFORE UPDATE ON public.order_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update order status based on QR coding progress
CREATE OR REPLACE FUNCTION public.update_order_qr_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Update the qr_coded_items count and status in delivery_orders
  UPDATE delivery_orders
  SET 
    qr_coded_items = (
      SELECT COUNT(*) 
      FROM order_materials 
      WHERE order_id = NEW.order_id AND is_qr_coded = true
    ),
    status = CASE
      WHEN (SELECT COUNT(*) FROM order_materials WHERE order_id = NEW.order_id AND is_qr_coded = true) = 
           (SELECT COUNT(*) FROM order_materials WHERE order_id = NEW.order_id)
      THEN 'ready_for_dispatch'
      ELSE 'pending_qr_coding'
    END,
    updated_at = now()
  WHERE id = NEW.order_id;
  
  RETURN NEW;
END;
$$;

-- Create trigger for updating order status
CREATE TRIGGER update_order_status_trigger
AFTER UPDATE OF is_qr_coded ON public.order_materials
FOR EACH ROW
EXECUTE FUNCTION public.update_order_qr_status();

-- Create function to generate order numbers
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for generating order numbers
CREATE TRIGGER generate_order_number_trigger
BEFORE INSERT ON public.delivery_orders
FOR EACH ROW
EXECUTE FUNCTION public.generate_order_number();