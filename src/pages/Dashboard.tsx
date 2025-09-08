import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Coins, 
  Gift, 
  TrendingUp, 
  Trophy,
  Star,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface Profile {
  loyalty_coins: number;
  total_points_earned: number;
  membership_tier: string;
  full_name: string;
}

interface RecentTransaction {
  id: string;
  transaction_type: string;
  points_amount: number;
  description: string;
  created_at: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRecentTransactions();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierProgress = () => {
    const currentCoins = profile?.loyalty_coins || 0;
    const tiers = {
      Bronze: { min: 0, max: 1000, color: 'from-amber-600 to-amber-400' },
      Silver: { min: 1000, max: 5000, color: 'from-gray-400 to-gray-300' },
      Gold: { min: 5000, max: 15000, color: 'from-yellow-500 to-yellow-300' },
      Platinum: { min: 15000, max: Infinity, color: 'from-purple-500 to-purple-300' }
    };
    
    const currentTier = profile?.membership_tier || 'Bronze';
    const tierInfo = tiers[currentTier as keyof typeof tiers];
    
    if (currentTier === 'Platinum') {
      return { progress: 100, nextTier: null, coinsNeeded: 0 };
    }
    
    const nextTierName = Object.keys(tiers).find(tier => 
      tiers[tier as keyof typeof tiers].min > currentCoins
    );
    
    const nextTierCoins = nextTierName ? tiers[nextTierName as keyof typeof tiers].min : tierInfo.max;
    const progress = Math.min(((currentCoins - tierInfo.min) / (nextTierCoins - tierInfo.min)) * 100, 100);
    
    return {
      progress,
      nextTier: nextTierName,
      coinsNeeded: nextTierCoins - currentCoins
    };
  };

  const tierProgress = getTierProgress();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            Welcome back, {profile?.full_name || 'Reward Member'}!
          </h1>
          <p className="text-xl text-muted-foreground">
            Your loyalty journey continues here
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary-glow/10 border-primary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Coins</CardTitle>
              <Coins className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{profile?.loyalty_coins || 0}</div>
              <p className="text-xs text-muted-foreground">Available for redemption</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-reward-gold/10 border-secondary/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{profile?.total_points_earned || 0}</div>
              <p className="text-xs text-muted-foreground">Lifetime points</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membership Tier</CardTitle>
              <Trophy className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{profile?.membership_tier || 'Bronze'}</div>
              <p className="text-xs text-muted-foreground">Current status</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
              <Gift className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Available to claim</p>
            </CardContent>
          </Card>
        </div>

        {/* Tier Progress */}
        {tierProgress.nextTier && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Tier Progress
              </CardTitle>
              <CardDescription>
                {tierProgress.coinsNeeded} more coins to reach {tierProgress.nextTier}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>{profile?.membership_tier}</span>
                <span>{tierProgress.nextTier}</span>
              </div>
              <Progress value={tierProgress.progress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{profile?.loyalty_coins} coins</span>
                <span>{tierProgress.coinsNeeded} coins needed</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Recent Activity
                </span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/history')}
                >
                  View All
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.transaction_type === 'earn' 
                          ? 'bg-success/20 text-success' 
                          : 'bg-secondary/20 text-secondary'
                      }`}>
                        {transaction.transaction_type === 'earn' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <Gift className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || 'Points Transaction'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.transaction_type === 'earn' 
                          ? 'text-success' 
                          : 'text-secondary'
                      }`}>
                        {transaction.transaction_type === 'earn' ? '+' : '-'}{transaction.points_amount}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.transaction_type}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Maximize your rewards today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full justify-between"
                onClick={() => navigate('/rewards')}
              >
                <span className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Browse Rewards
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="reward" 
                size="lg" 
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Add Coupon Code
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full justify-between"
                onClick={() => navigate('/history')}
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  View History
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;