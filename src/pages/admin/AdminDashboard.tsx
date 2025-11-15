import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Ticket, Users, TrendingUp, Shield, Lock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRewards: 0,
    activeCoupons: 0,
    totalUsers: 0,
    totalTransactions: 0,
    encryptedCoupons: 0,
    securityEvents: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [rewards, coupons, users, transactions, encrypted, security] = await Promise.all([
        supabase.from('rewards').select('id', { count: 'exact', head: true }),
        supabase.from('coupon_codes').select('id', { count: 'exact', head: true }).eq('is_used', false),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('coupon_codes').select('id', { count: 'exact', head: true }).not('encrypted_data', 'is', null),
        supabase.from('security_audit_log').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        totalRewards: rewards.count || 0,
        activeCoupons: coupons.count || 0,
        totalUsers: users.count || 0,
        totalTransactions: transactions.count || 0,
        encryptedCoupons: encrypted.count || 0,
        securityEvents: security.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Rewards', value: stats.totalRewards, icon: Gift, color: 'text-primary' },
    { title: 'Active Coupons', value: stats.activeCoupons, icon: Ticket, color: 'text-success' },
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-warning' },
    { title: 'Transactions', value: stats.totalTransactions, icon: TrendingUp, color: 'text-info' },
    { title: 'Encrypted Coupons', value: stats.encryptedCoupons, icon: Lock, color: 'text-primary' },
    { title: 'Security Events', value: stats.securityEvents, icon: Shield, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">Welcome to the admin panel</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
