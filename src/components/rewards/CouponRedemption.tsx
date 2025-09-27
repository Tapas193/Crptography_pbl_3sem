import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSecureTransaction } from '@/hooks/useSecureTransaction';
import { Shield, Gift, Lock, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CouponRedemptionProps {
  onSuccess?: () => void;
}

const CouponRedemption: React.FC<CouponRedemptionProps> = ({ onSuccess }) => {
  const [couponCode, setCouponCode] = useState('');
  const { redeemCoupon, loading } = useSecureTransaction();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a coupon code."
      });
      return;
    }

    const result = await redeemCoupon(
      couponCode.toUpperCase(),
      `Coupon redemption via secure transaction`
    );

    if (result) {
      setCouponCode('');
      onSuccess?.();
    }
  };

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card/80 to-card shadow-elegant max-w-md w-full">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="p-2 rounded-full bg-gradient-to-r from-primary to-primary-glow">
            <Gift className="w-5 h-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Secure Coupon Redemption</CardTitle>
        </div>
        <CardDescription className="flex items-center justify-center space-x-1">
          <Shield className="w-4 h-4 text-success" />
          <span>Protected by AES encryption & replay attack prevention</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="couponCode" className="text-sm font-medium flex items-center space-x-1">
              <Lock className="w-4 h-4" />
              <span>Coupon Code</span>
            </label>
            <Input
              id="couponCode"
              type="text"
              placeholder="Enter secure coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              maxLength={16}
              className="font-mono text-center tracking-wider bg-background/50"
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-success" />
              <span>Hash verified</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="w-3 h-3 text-success" />
              <span>Nonce protected</span>
            </div>
            <div className="flex items-center space-x-1">
              <Lock className="w-3 h-3 text-success" />
              <span>TLS encrypted</span>
            </div>
          </div>

          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
            disabled={loading || !couponCode.trim()}
          >
            {loading ? 'Processing Securely...' : 'Redeem Coupon'}
          </Button>
        </form>

        <div className="mt-6 space-y-2">
          <h4 className="font-semibold text-sm">Available Sample Codes:</h4>
          <div className="grid grid-cols-2 gap-2">
            {['CRYPTO100', 'SECURE75', 'LOYALTY50', 'WELCOME25'].map((code) => (
              <Badge 
                key={code}
                variant="outline" 
                className="justify-center p-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setCouponCode(code)}
              >
                {code}
              </Badge>
            ))}
          </div>
        </div>

        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
          <p className="text-xs text-warning-foreground">
            <strong>Security Features:</strong> Transaction integrity verification, 
            cryptographic nonces, AES coupon encryption, rate limiting, and HTTPS/TLS protection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponRedemption;