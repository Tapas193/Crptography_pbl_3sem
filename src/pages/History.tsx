import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  History as HistoryIcon, 
  TrendingUp, 
  Gift, 
  Calendar,
  Coins,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  transaction_type: string;
  points_amount: number;
  description: string;
  created_at: string;
  status: string;
}

interface Redemption {
  id: string;
  points_used: number;
  status: string;
  created_at: string;
  redemption_code?: string;
  rewards: {
    title: string;
    category: string;
  };
}

const History = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
      fetchRedemptions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchRedemptions = async () => {
    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards (
            title,
            category
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRedemptions(data || []);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'delivered':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-secondary" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
      case 'delivered':
        return 'bg-success/20 text-success';
      case 'pending':
        return 'bg-secondary/20 text-secondary';
      case 'failed':
      case 'cancelled':
        return 'bg-destructive/20 text-destructive';
      default:
        return 'bg-muted/20 text-muted-foreground';
    }
  };

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
            Transaction History
          </h1>
          <p className="text-xl text-muted-foreground">
            Track all your rewards activity in one place
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Coin Transactions
            </TabsTrigger>
            <TabsTrigger value="redemptions" className="flex items-center gap-2">
              <Gift className="w-4 h-4" />
              Reward Redemptions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Coin History
                </CardTitle>
                <CardDescription>
                  All your coin earning and spending activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            transaction.transaction_type === 'earn' 
                              ? 'bg-success/20 text-success' 
                              : transaction.transaction_type === 'redeem'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-primary/20 text-primary'
                          }`}>
                            {transaction.transaction_type === 'earn' ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : transaction.transaction_type === 'redeem' ? (
                              <Gift className="w-4 h-4" />
                            ) : (
                              <Coins className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.description || `${transaction.transaction_type} Transaction`}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(transaction.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(transaction.status)}
                          <div className="text-right">
                            <p className={`font-bold ${
                              transaction.transaction_type === 'earn' 
                                ? 'text-success' 
                                : 'text-secondary'
                            }`}>
                              {transaction.transaction_type === 'earn' ? '+' : '-'}
                              {transaction.points_amount} coins
                            </p>
                            <Badge className={getStatusColor(transaction.status)}>
                              {transaction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No transactions yet</h3>
                    <p className="text-muted-foreground">Start earning coins to see your transaction history</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redemptions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-primary" />
                  Redemption History
                </CardTitle>
                <CardDescription>
                  Track your reward redemptions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {redemptions.length > 0 ? (
                  <div className="space-y-4">
                    {redemptions.map((redemption) => (
                      <div key={redemption.id} className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20">
                            <Gift className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{redemption.rewards?.title}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(redemption.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                              {redemption.redemption_code && (
                                <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                  {redemption.redemption_code}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusIcon(redemption.status)}
                          <div className="text-right">
                            <p className="font-bold text-secondary">
                              -{redemption.points_used} coins
                            </p>
                            <Badge className={getStatusColor(redemption.status)}>
                              {redemption.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground">No redemptions yet</h3>
                    <p className="text-muted-foreground">Redeem your first reward to see it here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;