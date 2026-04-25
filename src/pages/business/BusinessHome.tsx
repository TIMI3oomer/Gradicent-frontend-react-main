import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingDown, ChartBar as BarChart3 } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { KPIGrid } from '../../components/business/KPIGrid';
import { RevenueChart } from '../../components/business/RevenueChart';
import { Badge } from '../../components/shared/Badge';
import { PlanBadge } from '../../components/business/PlanBadge';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { businessStats } from '../../data/stats';
import { mockClients } from '../../data/clients';
import { mockTransactions } from '../../data/transactions';
import { formatCurrency, formatDate } from '../../lib/formatters';

const kpiItems = [
  { title: 'Revenue This Month', value: businessStats.revenueThisMonth, prefix: '$', trend: 'up' as const, trendValue: '+12.4% vs last month', icon: <DollarSign size={18} /> },
  { title: 'Active Clients', value: businessStats.activeClients, trend: 'up' as const, trendValue: '+5 new this month', icon: <Users size={18} /> },
  { title: 'Churn Rate', value: businessStats.churnRate * 10, unit: '%', decimals: 1, trend: 'down' as const, trendValue: '-0.8% improvement', icon: <TrendingDown size={18} /> },
  { title: 'ROI', value: businessStats.roi, unit: '%', trend: 'up' as const, trendValue: '+28% vs last quarter', icon: <BarChart3 size={18} /> },
];

const topClients = mockClients.filter(c => c.status === 'Active').sort((a, b) => b.revenueYTD - a.revenueYTD).slice(0, 5);

type ClientRow = { rank: number; name: string; company: string; plan: string; revenueYTD: number; status: string; id: string };
const topClientRows: ClientRow[] = topClients.map((c, i) => ({ rank: i + 1, name: c.name, company: c.company, plan: c.plan, revenueYTD: c.revenueYTD, status: c.status, id: c.id }));

const recentTxns = mockTransactions.slice(0, 6);

export function BusinessHome() {
  const navigate = useNavigate();

  const clientColumns: Column<ClientRow>[] = [
    { key: 'rank', header: '#', width: '40px', align: 'center' },
    { key: 'name', header: 'Client', sortable: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{String(v)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.company}</div>
      </div>
    )},
    { key: 'plan', header: 'Plan', render: v => <PlanBadge plan={v as 'Basic' | 'Pro' | 'Enterprise'} size="sm" /> },
    { key: 'revenueYTD', header: 'Revenue YTD', align: 'right', sortable: true, render: v => (
      <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#22c55e' }}>
        {formatCurrency(v as number)}
      </span>
    )},
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Active' | 'Churned' | 'Lead'} size="sm" /> },
    { key: 'id', header: '', align: 'right', render: (_, row) => (
      <button className="btn-ghost btn-sm" onClick={() => navigate(`/business/clients/${row.id}`)}>View</button>
    )},
  ];

  return (
    <BusinessLayout title="Dashboard">
      <KPIGrid items={kpiItems} />

      {/* Row 2 */}
      <div className="two-col-wide" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue</div>
              <div className="card-subtitle">Monthly revenue — current vs previous year</div>
            </div>
          </div>
          <RevenueChart data={businessStats.revenueByMonth} height={260} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Recent Transactions</div>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/business/transactions')}>View all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTxns.map((txn, i) => (
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
            ))}
          </div>
        </div>
      </div>

      {/* Top clients */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Top Clients by Revenue</div>
          <button className="btn-ghost btn-sm" onClick={() => navigate('/business/clients')}>View all clients</button>
        </div>
        <DataTable
          data={topClientRows}
          columns={clientColumns}
          onRowClick={row => navigate(`/business/clients/${row.id}`)}
          rowKey="id"
        />
      </div>
    </BusinessLayout>
  );
}
