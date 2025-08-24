-- Create enhanced security for delivery acknowledgements payment information
-- First drop the overly permissive supplier policy
DROP POLICY IF EXISTS "Suppliers can view acknowledgements for their delivery notes" ON delivery_acknowledgements;

-- Create function to check if user can access payment information
CREATE OR REPLACE FUNCTION public.can_access_payment_info(acknowledgement_record delivery_acknowledgements)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' OR
      p.id = acknowledgement_record.acknowledger_id
    )
  );
$$;

-- Create secure view for delivery acknowledgements without payment details
CREATE OR REPLACE VIEW public.delivery_acknowledgements_public AS
SELECT 
  id,
  delivery_note_id,
  acknowledged_by,
  acknowledger_id,
  acknowledgement_date,
  digital_signature,
  comments,
  signed_document_path,
  created_at,
  updated_at,
  -- Only show payment info if user has proper access
  CASE 
    WHEN public.can_access_payment_info(delivery_acknowledgements.*) THEN payment_status
    ELSE 'processed'
  END as payment_status,
  CASE 
    WHEN public.can_access_payment_info(delivery_acknowledgements.*) THEN payment_method
    ELSE NULL
  END as payment_method,
  CASE 
    WHEN public.can_access_payment_info(delivery_acknowledgements.*) THEN payment_reference
    ELSE NULL
  END as payment_reference
FROM delivery_acknowledgements;

-- Enable RLS on the view
ALTER VIEW public.delivery_acknowledgements_public SET (security_barrier = true);

-- Create new restricted policy for suppliers (non-payment access)
CREATE POLICY "Suppliers can view non-payment acknowledgement details"
ON delivery_acknowledgements
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM ((delivery_notes dn
      JOIN suppliers s ON s.id = dn.supplier_id)
      JOIN profiles p ON p.id = s.user_id)
    WHERE p.user_id = auth.uid() 
    AND dn.id = delivery_acknowledgements.delivery_note_id
  )
);

-- Grant access to the public view
GRANT SELECT ON public.delivery_acknowledgements_public TO authenticated;

-- Create RLS policy for the public view
CREATE POLICY "Users can view public acknowledgement information"
ON public.delivery_acknowledgements_public
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles p
    LEFT JOIN suppliers s ON s.user_id = p.id
    LEFT JOIN delivery_notes dn ON dn.supplier_id = s.id
    WHERE p.user_id = auth.uid() 
    AND (
      p.role = 'admin' OR
      p.id = delivery_acknowledgements_public.acknowledger_id OR
      dn.id = delivery_acknowledgements_public.delivery_note_id
    )
  )
);

-- Create audit log for payment information access
CREATE TABLE IF NOT EXISTS public.payment_info_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  acknowledgement_id uuid REFERENCES delivery_acknowledgements(id),
  accessed_at timestamp with time zone DEFAULT now(),
  access_type text NOT NULL, -- 'view', 'export', 'update'
  ip_address inet,
  user_agent text,
  payment_fields_accessed text[] -- which payment fields were accessed
);

ALTER TABLE public.payment_info_access_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view payment access logs"
ON public.payment_info_access_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to log payment info access
CREATE OR REPLACE FUNCTION public.log_payment_info_access(
  acknowledgement_uuid uuid,
  access_type_param text,
  fields_accessed text[] DEFAULT ARRAY[]::text[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO payment_info_access_log (
    user_id, 
    acknowledgement_id, 
    access_type, 
    payment_fields_accessed
  )
  VALUES (
    auth.uid(), 
    acknowledgement_uuid, 
    access_type_param, 
    fields_accessed
  );
END;
$$;

-- Create function to get secure acknowledgement data
CREATE OR REPLACE FUNCTION public.get_secure_acknowledgement(acknowledgement_uuid uuid)
RETURNS TABLE (
  id uuid,
  delivery_note_id uuid,
  acknowledged_by text,
  acknowledger_id uuid,
  acknowledgement_date timestamptz,
  digital_signature text,
  comments text,
  signed_document_path text,
  created_at timestamptz,
  updated_at timestamptz,
  can_view_payment boolean,
  payment_status text,
  payment_method text,
  payment_reference text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  can_access_payment boolean;
  record_data delivery_acknowledgements%ROWTYPE;
BEGIN
  -- Get the acknowledgement record
  SELECT * INTO record_data 
  FROM delivery_acknowledgements 
  WHERE delivery_acknowledgements.id = acknowledgement_uuid;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check if user can access payment information
  SELECT public.can_access_payment_info(record_data) INTO can_access_payment;
  
  -- Log access if payment fields are being viewed
  IF can_access_payment THEN
    PERFORM public.log_payment_info_access(
      acknowledgement_uuid, 
      'secure_view', 
      ARRAY['payment_status', 'payment_method', 'payment_reference']
    );
  END IF;
  
  -- Return data with conditional payment information
  RETURN QUERY SELECT
    record_data.id,
    record_data.delivery_note_id,
    record_data.acknowledged_by,
    record_data.acknowledger_id,
    record_data.acknowledgement_date,
    record_data.digital_signature,
    record_data.comments,
    record_data.signed_document_path,
    record_data.created_at,
    record_data.updated_at,
    can_access_payment,
    CASE WHEN can_access_payment THEN record_data.payment_status ELSE 'processed' END,
    CASE WHEN can_access_payment THEN record_data.payment_method ELSE NULL END,
    CASE WHEN can_access_payment THEN record_data.payment_reference ELSE NULL END;
END;
$$;