import { useState, useEffect } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { KPIGrid } from '../../components/business/KPIGrid';
import { RevenueChart } from '../../components/business/RevenueChart';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { formatCurrency } from '../../lib/formatters';
import { DollarSign, Users, TrendingDown, ChartBar as BarChart3, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PIE_COLORS = ['#1171BB', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

export function BusinessStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGaiaStats = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const query = api.getContextQuery('business', user.id);
        // Calls the dynamic Gaia metrics engine on the backend
        const res = await api.safeFetch(`/api/gaia/compute${query}&metric=business_dashboard`);
        setStats(res.data);
      } catch (err) {
        console.error('[Gaia Analytics] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGaiaStats();
  }, [user?.id]);

  if (isLoading || !stats) {
    return (
      <BusinessLayout title="Analytics">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Compiling Gaia Engine metrics...</div>
      </BusinessLayout>
    );
  }

  const kpiItems = [
    { title: 'Total Revenue YTD', value: stats.totalRevenueYTD || 0, prefix: '$', trend: 'up' as const, trendValue: '+22% vs last year', icon: <DollarSign size={18} /> },
    { title: 'Active Clients', value: stats.activeClients || 0, trend: 'up' as const, trendValue: `+${stats.newClientsThisMonth || 0} this month`, icon: <Users size={18} /> },
    { title: 'Churn Rate', value: stats.churnRate || 0, unit: '%', decimals: 1, trend: 'down' as const, trendValue: '-0.8% improvement', icon: <TrendingDown size={18} /> },
  ];

  return (
    <BusinessLayout title="Analytics">
      <KPIGrid items={kpiItems} />

      <div className="two-col-wide" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
            </div>
          </div>
          <RevenueChart data={stats.revenueByMonth || []} height={260} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by Service</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.topServices || []} layout="vertical" margin={{ left: 8, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="service" width={130} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#1171BB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </BusinessLayout>
  );
}