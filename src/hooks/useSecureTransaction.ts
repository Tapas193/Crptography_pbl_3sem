import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  generateTransactionNonce, 
  createTransactionHash, 
  checkRateLimit,
  encryptCouponCode,
  generateEncryptionKey,
  exportKey
} from '@/lib/crypto';

interface SecureTransactionParams {
  amount: number;
  type: 'earn' | 'redeem';
  description: string;
  couponCode?: string;
}

export const useSecureTransaction = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const processSecureTransaction = async (params: SecureTransactionParams) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to process transactions."
      });
      return null;
    }

    // Rate limiting check
    if (!checkRateLimit('transaction', 10, 60000)) { // 10 transactions per minute
      toast({
        variant: "destructive",
        title: "Rate Limit Exceeded",
        description: "Too many transactions. Please wait before trying again."
      });
      return null;
    }

    setLoading(true);

    try {
      // Generate secure transaction parameters
      const nonce = generateTransactionNonce();
      const timestamp = Date.now();
      const hash = await createTransactionHash(user.id, params.amount, nonce, timestamp);

      // Encrypt coupon code if provided
      let encryptedCouponCode = params.couponCode;
      if (params.couponCode) {
        try {
          const key = await generateEncryptionKey();
          const keyString = await exportKey(key);
          const encrypted = await encryptCouponCode(params.couponCode, key);
          
          // In production, store the key securely on the server
          // For demo purposes, we'll pass the encrypted data
          encryptedCouponCode = `${encrypted.encryptedData}:${encrypted.iv}:${keyString}`;
        } catch (error) {
          console.error('Encryption error:', error);
          toast({
            variant: "destructive",
            title: "Encryption Error",
            description: "Failed to encrypt coupon code."
          });
          return null;
        }
      }

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No valid session');
      }

      // Call secure transaction edge function
      const { data: result, error: invokeError } = await supabase.functions.invoke('secure-transaction', {
        body: {
          userId: user.id,
          amount: params.amount,
          type: params.type,
          description: params.description,
          nonce,
          timestamp,
          hash,
          couponCode: encryptedCouponCode
        }
      });

      if (invokeError) {
        throw new Error(invokeError.message || 'Transaction failed');
      }

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      toast({
        title: "Transaction Successful",
        description: result.message,
      });

      return result;

    } catch (error) {
      console.error('Secure transaction error:', error);
      
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred."
      });
      
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redeemCoupon = async (couponCode: string, description: string) => {
    // Validate coupon code format
    if (!/^[A-Z0-9]{8,16}$/.test(couponCode)) {
      toast({
        variant: "destructive",
        title: "Invalid Coupon",
        description: "Coupon code must be 8-16 characters, letters and numbers only."
      });
      return null;
    }

    // For demo purposes, assign random points based on coupon pattern
    const points = calculateCouponValue(couponCode);
    
    return processSecureTransaction({
      amount: points,
      type: 'earn',
      description: `${description} - Coupon: ${couponCode}`,
      couponCode
    });
  };

  const redeemReward = async (rewardId: string, cost: number, description: string) => {
    return processSecureTransaction({
      amount: cost,
      type: 'redeem',
      description: `Redeemed: ${description}`,
    });
  };

  return {
    processSecureTransaction,
    redeemCoupon,
    redeemReward,
    loading
  };
};

/**
 * Calculate coupon value based on coupon code pattern
 * In production, this would validate against a database
 */
const calculateCouponValue = (couponCode: string): number => {
  // Simple algorithm for demo - in production, validate against database
  const hash = couponCode.split('').reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  
  // Return points between 10-100 based on hash
  return (hash % 91) + 10;
};