-- Create payment_preferences table to store user payment method preferences
CREATE TABLE public.payment_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  payment_method TEXT NOT NULL,
  payment_details JSONB,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payment_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for payment preferences
CREATE POLICY "Users can view their own payment preferences" 
ON public.payment_preferences 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.id = payment_preferences.user_id
));

CREATE POLICY "Users can insert their own payment preferences" 
ON public.payment_preferences 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.id = payment_preferences.user_id
));

CREATE POLICY "Users can update their own payment preferences" 
ON public.payment_preferences 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.id = payment_preferences.user_id
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_payment_preferences_updated_at
BEFORE UPDATE ON public.payment_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();