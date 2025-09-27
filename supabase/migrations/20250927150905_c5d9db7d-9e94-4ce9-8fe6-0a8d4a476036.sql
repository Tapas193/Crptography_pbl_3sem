-- Fix the unique constraint issue and complete security setup
-- Drop existing constraint if it exists
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS unique_nonce;

-- Add security fields to transactions table (with proper handling)
ALTER TABLE public.transactions 
  ALTER COLUMN nonce SET NOT NULL,
  ADD CONSTRAINT transactions_nonce_unique UNIQUE (nonce);

-- Update existing transactions with secure nonces where missing
UPDATE public.transactions 
SET nonce = gen_random_uuid()::text || extract(epoch from now())::text
WHERE nonce IS NULL;

-- Add proper constraints
ALTER TABLE public.transactions 
  ADD CONSTRAINT check_transaction_type CHECK (transaction_type IN ('earn', 'redeem', 'transfer'));

-- Insert sample secure coupon codes if they don't exist
INSERT INTO public.coupon_codes (code, value, expires_at) VALUES
('CRYPTO100', 100, now() + interval '30 days'),
('SECURE75', 75, now() + interval '21 days'),
('LOYALTY50', 50, now() + interval '14 days'),
('WELCOME25', 25, now() + interval '7 days')
ON CONFLICT (code) DO NOTHING;