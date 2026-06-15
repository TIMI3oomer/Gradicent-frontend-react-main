import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingDown, ChartBar as BarChart3 } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { KPIGrid } from '../../components/business/KPIGrid';
import { RevenueChart } from '../../components/business/RevenueChart';
import { Badge } from '../../components/shared/Badge';
import { PlanBadge } from '../../components/business/PlanBadge';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { formatCurrency, formatDate } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

type ClientRow = { rank: number; name: string; company: string; plan: string; revenueYTD: number; status: string; id: string };

export function BusinessHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<ClientRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardContext = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const query = api.getContextQuery('business', user.id);
        
        // Fetch Gaia Metrics, Latest Ledger, and Global Clients concurrently
        const [statsRes, txnsRes, clientsRes] = await Promise.all([
          api.safeFetch(`/api/gaia/compute${query}&metric=business_dashboard`),
          api.searchEntities<any>('/api/binder/transactions/search', { domain: 'business', user_id: user.id, query: '' }).catch(() => ({ data: [] })),
          api.searchEntities<any>('/api/binder/client/search', { domain: 'business', user_id: user.id, query: '' }).catch(() => ({ data: [] }))
        ]);

        const rawTxns = txnsRes.data?.results || txnsRes.data || [];
        const rawClients = clientsRes.data?.results || clientsRes.data || [];

        setStats(statsRes.data);
        setRecentTxns((Array.isArray(rawTxns) ? rawTxns : []).slice(0, 6));
        
        const top = (Array.isArray(rawClients) ? rawClients : [])
          .filter(c => c.status === 'Active')
          .sort((a, b) => b.revenueYTD - a.revenueYTD)
          .slice(0, 5)
          .map((c, i) => ({ rank: i + 1, name: c.name, company: c.company, plan: c.plan, revenueYTD: c.revenueYTD, status: c.status, id: c.id }));
          
        setTopClients(top);
      } catch (err) {
        console.error('[Dashboard] Error building hub context:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardContext();
  }, [user?.id]);

  if (isLoading || !stats) {
    return (
      <BusinessLayout title="Dashboard">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Assembling Executive Dashboard...</div>
      </BusinessLayout>
    );
  }

  const kpiItems = [
    { title: 'Revenue This Month', value: stats.revenueThisMonth || 0, prefix: '$', trend: 'up' as const, trendValue: '+12.4% vs last month', icon: <DollarSign size={18} /> },
    { title: 'Active Clients', value: stats.activeClients || 0, trend: 'up' as const, trendValue: '+5 new this month', icon: <Users size={18} /> },
    { title: 'Churn Rate', value: (stats.churnRate || 0) * 10, unit: '%', decimals: 1, trend: 'down' as const, trendValue: '-0.8% improvement', icon: <TrendingDown size={18} /> },
    { title: 'ROI', value: stats.roi || 0, unit: '%', trend: 'up' as const, trendValue: '+28% vs last quarter', icon: <BarChart3 size={18} /> },
  ];

  const clientColumns: Column<ClientRow>[] = [
    { key: 'rank', header: '#', width: '40px', align: 'center' },
    { key: 'name', header: 'Client', sortable: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{String(v)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.company}</div>
      </div>
    )},
    { key: 'plan', header: 'Plan', render: v => <PlanBadge plan={v as any} size="sm" /> },
    { key: 'revenueYTD', header: 'Revenue YTD', align: 'right', sortable: true, render: v => (
      <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#22c55e' }}>
        {formatCurrency(Number(v))}
      </span>
    )},
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> },
    { key: 'id', header: '', align: 'right', render: (_, row) => (
      <button className="btn-ghost btn-sm" onClick={() => navigate(`/business/clients/${row.id}`)}>View</button>
    )},
  ];

  return (
    <BusinessLayout title="Dashboard">
      <KPIGrid items={kpiItems} />

      <div className="two-col-wide" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue</div>
              <div className="card-subtitle">Monthly revenue — current vs previous year</div>
            </div>
          </div>
          <RevenueChart data={stats.revenueByMonth || []} height={260} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Transactions</div>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/business/transactions')}>View all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTxns.length === 0 ? (
               <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No recent activity.</div>
            ) : (
              recentTxns.map((txn, i) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < recentTxns.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txn.clientName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{txn.type} · {formatDate(txn.date, 'short')}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: txn.type === 'Refund' ? 'var(--danger)' : 'var(--success)', textAlign: 'right' }}>
                    {txn.type === 'Refund' ? '-' : '+'}{formatCurrency(txn.amount)}
                  </div>
                  <Badge status={txn.status} size="sm" />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Top Clients by Revenue</div>
          <button className="btn-ghost btn-sm" onClick={() => navigate('/business/clients')}>View all clients</button>
        </div>
        <DataTable data={topClients} columns={clientColumns} onRowClick={row => navigate(`/business/clients/${row.id}`)} rowKey="id" />
      </div>
    </BusinessLayout>
  );
}