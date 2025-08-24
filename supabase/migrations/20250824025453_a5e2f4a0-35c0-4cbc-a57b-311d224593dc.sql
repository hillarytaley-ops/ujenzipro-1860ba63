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
      SELECT 1 FROM delivery_orders delivery_order
      JOIN profiles p ON p.user_id = auth.uid()
      WHERE delivery_order.id = scanned_supplies.delivery_order_id 
      AND p.id = delivery_order.builder_id
    )
  )
);

-- 3. Add rate limiting table for API protection
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