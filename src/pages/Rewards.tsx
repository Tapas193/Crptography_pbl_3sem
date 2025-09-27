import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSecureTransaction } from '@/hooks/useSecureTransaction';
import CouponRedemption from '@/components/rewards/CouponRedemption';
import { 
  Gift, 
  Search, 
  Filter,
  Coins,
  ShoppingCart,
  Coffee,
  Play,
  Shirt,
  Car,
  Shield,
  Sparkles
} from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  category: string;
  image_url?: string;
  terms_conditions: string;
  stock_quantity?: number;
}

const categoryIcons = {
  gift_cards: ShoppingCart,
  food_beverage: Coffee,
  entertainment: Play,
  fashion: Shirt,
  transportation: Car,
  general: Gift
};

const Rewards = () => {
  const { user } = useAuth();
  const { redeemReward, loading: transactionLoading } = useSecureTransaction();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchRewards();
    fetchUserCoins();
  }, []);

  useEffect(() => {
    filterRewards();
  }, [rewards, searchTerm, selectedCategory]);

  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_required', { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCoins = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('loyalty_coins')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserCoins(data?.loyalty_coins || 0);
    } catch (error) {
      console.error('Error fetching user coins:', error);
    }
  };

  const filterRewards = () => {
    let filtered = rewards;

    if (searchTerm) {
      filtered = filtered.filter(reward =>
        reward.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(reward => reward.category === selectedCategory);
    }

    setFilteredRewards(filtered);
  };

  const handleRedeem = async (reward: Reward) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to redeem rewards."
      });
      return;
    }

    const result = await redeemReward(
      reward.id,
      reward.points_required,
      reward.title
    );

    if (result) {
      // Refresh user coins
      fetchUserCoins();
    }
  };

  const categories = Array.from(new Set(rewards.map(r => r.category)));

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
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
            Secure Rewards Catalog
          </h1>
          <p className="text-xl text-muted-foreground">
            Redeem your loyalty coins for amazing rewards with military-grade security
          </p>
          <div className="flex items-center justify-center gap-2 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20">
            <Coins className="w-6 h-6 text-primary" />
            <span className="text-lg font-semibold">Your Coins: {userCoins}</span>
            <Shield className="w-4 h-4 text-primary ml-2" />
          </div>
        </div>

        {/* Coupon Redemption Section */}
        <div className="flex justify-center">
          <CouponRedemption />
        </div>

        {/* Sample Coupon Codes */}
        <Card className="bg-gradient-to-r from-muted/50 to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Sparkles className="w-5 h-5" />
              Try These Sample Codes
            </CardTitle>
            <CardDescription>
              Test the secure redemption system with these sample coupon codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                <code className="font-mono text-sm text-primary">WELCOME2025</code>
                <p className="text-xs text-muted-foreground mt-1">100 coins</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                <code className="font-mono text-sm text-primary">CRYPTO50</code>
                <p className="text-xs text-muted-foreground mt-1">50 coins</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                <code className="font-mono text-sm text-primary">SECURE25</code>
                <p className="text-xs text-muted-foreground mt-1">25 coins</p>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-primary/10">
                <code className="font-mono text-sm text-primary">LOYALTY75</code>
                <p className="text-xs text-muted-foreground mt-1">75 coins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search rewards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRewards.map((reward) => {
            const IconComponent = categoryIcons[reward.category as keyof typeof categoryIcons] || Gift;
            const canAfford = userCoins >= reward.points_required;
            
            return (
              <Card key={reward.id} className={`shadow-lg transition-all duration-300 hover:shadow-xl ${
                canAfford ? 'hover:scale-105' : 'opacity-75'
              }`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <Badge variant={canAfford ? "default" : "secondary"} className="ml-2">
                      {reward.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{reward.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {reward.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-primary" />
                      <span className="font-bold text-lg">{reward.points_required}</span>
                      <span className="text-sm text-muted-foreground">coins</span>
                    </div>
                    {reward.stock_quantity && (
                      <Badge variant="outline">
                        {reward.stock_quantity} left
                      </Badge>
                    )}
                  </div>
                  
                  <Button
                    variant={canAfford ? "hero" : "outline"}
                    size="lg"
                    className="w-full"
                    disabled={!canAfford || loading || transactionLoading}
                    onClick={() => handleRedeem(reward)}
                  >
                    {transactionLoading ? 'Processing Securely...' : canAfford ? 'Redeem Securely' : 'Not Enough Coins'}
                  </Button>
                  
                  {reward.terms_conditions && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      Terms: {reward.terms_conditions}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground">No rewards found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Rewards;