-- Add security fields to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS nonce TEXT UNIQUE;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transaction_hash TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Create index for nonce lookups (prevent replay attacks)
CREATE INDEX IF NOT EXISTS idx_transactions_nonce ON public.transactions(nonce);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON public.transactions(user_id, created_at);

-- Add constraint to ensure nonce uniqueness
ALTER TABLE public.transactions ADD CONSTRAINT unique_nonce UNIQUE (nonce);

-- Create secure coupon codes table
CREATE TABLE IF NOT EXISTS public.coupon_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  value INTEGER NOT NULL,
  encrypted_data TEXT,
  encryption_iv TEXT,
  is_used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on coupon_codes
ALTER TABLE public.coupon_codes ENABLE ROW LEVEL SECURITY;

-- Coupon codes policies
CREATE POLICY "Users can view available coupon codes" 
ON public.coupon_codes 
FOR SELECT 
USING (is_used = FALSE AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "System can update coupon usage" 
ON public.coupon_codes 
FOR UPDATE 
USING (auth.uid() = used_by OR auth.uid() IS NOT NULL);

-- Create trigger for coupon_codes updated_at
CREATE TRIGGER update_coupon_codes_updated_at
BEFORE UPDATE ON public.coupon_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create security audit log table
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on security_audit_log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Security audit policies (only system/admin access)
CREATE POLICY "System can insert audit logs" 
ON public.security_audit_log 
FOR INSERT 
WITH CHECK (true);

-- Add some sample secure coupon codes
INSERT INTO public.coupon_codes (code, value, expires_at) VALUES
('WELCOME2025', 100, now() + interval '30 days'),
('CRYPTO50', 50, now() + interval '7 days'),
('SECURE25', 25, now() + interval '14 days'),
('LOYALTY75', 75, now() + interval '60 days')
ON CONFLICT (code) DO NOTHING;