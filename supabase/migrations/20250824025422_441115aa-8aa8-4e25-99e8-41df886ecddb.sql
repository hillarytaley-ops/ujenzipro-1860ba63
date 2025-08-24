-- Fix remaining security issues by implementing proper access controls

-- 1. Restrict feedback visibility to relevant parties only
DROP POLICY IF EXISTS "Users can view all feedback" ON public.feedback;

CREATE POLICY "Users can view relevant feedback only" 
ON public.feedback 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Users can see their own feedback
    user_id = auth.uid() OR
    -- Admins can see all feedback
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    -- Service providers can see feedback about their services
    EXISTS (
      SELECT 1 FROM deliveries d
      JOIN profiles p ON p.user_id = auth.uid()
      LEFT JOIN suppliers s ON s.user_id = p.id  
      WHERE d.id = feedback.delivery_id 
      AND (s.id = d.supplier_id OR p.id = d.builder_id)
    )
  )
);

-- 2. Restrict scanned_supplies to authenticated business participants only
DROP POLICY IF EXISTS "Users can view all scanned supplies" ON public.scanned_supplies;

CREATE POLICY "Authenticated users can view relevant scanned supplies" 
ON public.scanned_supplies 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND (
    -- Admins can view all
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    ) OR
    -- Suppliers can view their own supplies
    EXISTS (
      SELECT 1 FROM profiles p
      LEFT JOIN suppliers s ON s.user_id = p.id
      WHERE p.user_id = auth.uid() AND s.id = scanned_supplies.supplier_id
    ) OR
    -- Only show supplies that are part of active business relationships
    EXISTS (
      SELECT 1 FROM delivery_orders do
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE do.id = scanned_supplies.delivery_order_id 
      AND p.id = do.builder_id
    )
  )
);

-- 3. Add rate limiting table and function for API protection
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ip_address INET,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own rate limit data
CREATE POLICY "Users can view their own rate limits" 
ON public.api_rate_limits 
FOR SELECT 
USING (user_id = auth.uid());

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_endpoint TEXT DEFAULT 'general',
  p_limit INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count INTEGER;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  window_start_time := now() - (p_window_minutes || ' minutes')::INTERVAL;
  
  -- Get or create rate limit record
  SELECT request_count INTO current_count
  FROM api_rate_limits
  WHERE 
    (p_user_id IS NULL OR user_id = p_user_id) AND
    (p_ip_address IS NULL OR ip_address = p_ip_address) AND
    endpoint = p_endpoint AND
    window_start > window_start_time;
  
  -- If no record exists or window expired, create new record
  IF current_count IS NULL THEN
    INSERT INTO api_rate_limits (user_id, ip_address, endpoint, request_count, window_start)
    VALUES (p_user_id, p_ip_address, p_endpoint, 1, now())
    ON CONFLICT (user_id, ip_address, endpoint) 
    DO UPDATE SET 
      request_count = 1,
      window_start = now(),
      updated_at = now();
    RETURN TRUE;
  END IF;
  
  -- Check if limit exceeded
  IF current_count >= p_limit THEN
    RETURN FALSE;
  END IF;
  
  -- Increment counter
  UPDATE api_rate_limits 
  SET 
    request_count = request_count + 1,
    updated_at = now()
  WHERE 
    (p_user_id IS NULL OR user_id = p_user_id) AND
    (p_ip_address IS NULL OR ip_address = p_ip_address) AND
    endpoint = p_endpoint AND
    window_start > window_start_time;
    
  RETURN TRUE;
END;
$$;

-- Add unique constraint for rate limiting
ALTER TABLE public.api_rate_limits 
ADD CONSTRAINT unique_rate_limit_entry 
UNIQUE (user_id, ip_address, endpoint);

-- Clean up old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM api_rate_limits 
  WHERE window_start < now() - INTERVAL '24 hours';
END;
$$;