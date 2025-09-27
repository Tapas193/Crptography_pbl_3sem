import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TransactionRequest {
  userId: string;
  amount: number;
  type: 'earn' | 'redeem';
  description: string;
  nonce: string;
  timestamp: number;
  hash: string;
  couponCode?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify JWT token
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    const transaction: TransactionRequest = await req.json();

    // Verify transaction belongs to authenticated user
    if (transaction.userId !== user.id) {
      throw new Error('Unauthorized transaction');
    }

    // Verify transaction hash to prevent tampering
    const expectedHash = await createTransactionHash(
      transaction.userId,
      transaction.amount,
      transaction.nonce,
      transaction.timestamp
    );

    if (transaction.hash !== expectedHash) {
      throw new Error('Transaction hash verification failed');
    }

    // Check for replay attacks - nonce should be unique
    const { data: existingTx } = await supabaseClient
      .from('transactions')
      .select('id')
      .eq('nonce', transaction.nonce)
      .single();

    if (existingTx) {
      throw new Error('Transaction nonce already used - replay attack detected');
    }

    // Verify timestamp is recent (within 5 minutes)
    const now = Date.now();
    const timeDiff = Math.abs(now - transaction.timestamp);
    if (timeDiff > 5 * 60 * 1000) {
      throw new Error('Transaction timestamp too old or too far in future');
    }

    // Rate limiting check
    const recentTransactions = await supabaseClient
      .from('transactions')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', new Date(now - 60000).toISOString()) // Last minute
      .order('created_at', { ascending: false });

    if (recentTransactions.data && recentTransactions.data.length >= 10) {
      throw new Error('Rate limit exceeded - too many transactions');
    }

    // Process coupon code decryption if provided
    let decryptedCouponCode = null;
    if (transaction.couponCode) {
      try {
        // In production, implement server-side decryption
        decryptedCouponCode = transaction.couponCode;
      } catch (error) {
        throw new Error('Invalid coupon code encryption');
      }
    }

    // Get current user profile
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('loyalty_coins')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      throw new Error('User profile not found');
    }

    const currentCoins = profile.loyalty_coins || 0;

    // Validate transaction amount
    if (transaction.type === 'redeem' && currentCoins < Math.abs(transaction.amount)) {
      throw new Error('Insufficient loyalty coins');
    }

    if (transaction.amount === 0) {
      throw new Error('Transaction amount cannot be zero');
    }

    // Calculate new coin balance
    const newBalance = transaction.type === 'earn' 
      ? currentCoins + Math.abs(transaction.amount)
      : currentCoins - Math.abs(transaction.amount);

    // Create transaction record
    const { data: newTransaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: transaction.type === 'earn' ? Math.abs(transaction.amount) : -Math.abs(transaction.amount),
        type: transaction.type,
        description: transaction.description,
        nonce: transaction.nonce,
        transaction_hash: transaction.hash,
        coupon_code: decryptedCouponCode,
        status: 'completed'
      })
      .select()
      .single();

    if (txError) {
      throw new Error(`Transaction creation failed: ${txError.message}`);
    }

    // Update user's loyalty coin balance
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({ loyalty_coins: newBalance })
      .eq('user_id', user.id);

    if (updateError) {
      // Rollback transaction
      await supabaseClient
        .from('transactions')
        .delete()
        .eq('id', newTransaction.id);
      
      throw new Error('Failed to update user balance');
    }

    // Log security event
    console.log(`Secure transaction completed: ${user.id} - ${transaction.type} - ${transaction.amount} coins`);

    return new Response(
      JSON.stringify({
        success: true,
        transaction: newTransaction,
        newBalance: newBalance,
        message: `Transaction completed successfully. ${transaction.type === 'earn' ? 'Earned' : 'Redeemed'} ${Math.abs(transaction.amount)} coins.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Secure transaction error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Create secure transaction hash for integrity verification
 */
async function createTransactionHash(
  userId: string,
  amount: number,
  nonce: string,
  timestamp: number
): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${userId}:${amount}:${nonce}:${timestamp}`);
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}