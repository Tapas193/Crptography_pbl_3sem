import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Lock } from 'lucide-react';
import { useSecureTransaction } from '@/hooks/useSecureTransaction';

const CouponRedemption = () => {
  const [couponCode, setCouponCode] = useState('');
  const { redeemCoupon, loading } = useSecureTransaction();

  const handleRedeemCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    await redeemCoupon(
      couponCode.toUpperCase(),
      `Coupon redemption from external partner`
    );
    
    setCouponCode('');
  };

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-card/90 to-card/50 backdrop-blur border-primary/20">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl">Redeem Secure Coupon</CardTitle>
        <CardDescription>
          Enter your encrypted coupon code from partner websites
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleRedeemCoupon} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="couponCode" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Coupon Code
            </Label>
            <Input
              id="couponCode"
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="bg-background/50 font-mono tracking-wider"
              maxLength={16}
            />
          </div>
          
          <Button 
            type="submit" 
            variant="hero" 
            size="lg" 
            className="w-full"
            disabled={loading || !couponCode.trim()}
          >
            {loading ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Redeem Securely
              </>
            )}
          </Button>
        </form>
        
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-primary/10">
          <p className="text-xs text-muted-foreground">
            🔒 <strong>Secure Redemption:</strong> All coupons are encrypted with AES-256 
            and protected against replay attacks using blockchain-inspired verification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponRedemption;