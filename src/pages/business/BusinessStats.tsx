import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { KPIGrid } from '../../components/business/KPIGrid';
import { RevenueChart } from '../../components/business/RevenueChart';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { businessStats } from '../../data/stats';
import { formatCurrency } from '../../lib/formatters';
import { DollarSign, Users, TrendingDown, ChartBar as BarChart3, Briefcase } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const kpiItems = [
  { title: 'Total Revenue YTD', value: businessStats.totalRevenueYTD, prefix: '$', trend: 'up' as const, trendValue: '+22% vs last year', icon: <DollarSign size={18} /> },
  { title: 'Revenue This Month', value: businessStats.revenueThisMonth, prefix: '$', trend: 'up' as const, trendValue: `+${Math.round(((businessStats.revenueThisMonth - businessStats.lastMonthRevenue) / businessStats.lastMonthRevenue) * 100)}% vs last month`, icon: <BarChart3 size={18} /> },
  { title: 'Active Clients', value: businessStats.activeClients, trend: 'up' as const, trendValue: `+${businessStats.newClientsThisMonth} this month`, icon: <Users size={18} /> },
  { title: 'Churn Rate', value: businessStats.churnRate, unit: '%', decimals: 1, trend: 'down' as const, trendValue: '-0.8% improvement', icon: <TrendingDown size={18} /> },
  { title: 'ROI', value: businessStats.roi, unit: '%', trend: 'up' as const, trendValue: '+9% vs last quarter', icon: <Briefcase size={18} /> },
];

const PIE_COLORS = ['#1171BB', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

type ProdRow = { name: string; deals: number; revenue: number; satisfaction: number; completion: number };

const prodColumns: Column<ProdRow>[] = [
  { key: 'name', header: 'Employee', sortable: true, render: v => <span style={{ fontWeight: 600, fontSize: 13 }}>{String(v)}</span> },
  { key: 'deals', header: 'Deals', align: 'right', sortable: true, render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{String(v)}</span> },
  {
    key: 'revenue', header: 'Revenue Generated', align: 'right', sortable: true, render: v => (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#22c55e', fontSize: 13 }}>{formatCurrency(v as number)}</span>
    ),
  },
  {
    key: 'satisfaction', header: 'CSAT', align: 'right', render: v => (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: (v as number) >= 95 ? '#22c55e' : '#f59e0b', fontSize: 13 }}>{String(v)}%</span>
    ),
  },
  {
    key: 'completion', header: 'Task Completion', align: 'right', render: v => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
        <div style={{ width: 60, height: 6, background: 'var(--border)', borderRadius: 3 }}>
          <div style={{ width: `${v}%`, height: '100%', background: (v as number) >= 90 ? '#22c55e' : '#f59e0b', borderRadius: 3 }} />
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{String(v)}%</span>
      </div>
    ),
  },
];

export function BusinessStats() {
  return (
    <BusinessLayout title="Analytics">
      <KPIGrid items={kpiItems} />

      <div className="two-col-wide" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-subtitle">Monthly revenue — current vs previous year</div>
            </div>
          </div>
          <RevenueChart data={businessStats.revenueByMonth} height={260} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by Service</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={businessStats.topServices} layout="vertical" margin={{ left: 8, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="service" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={130} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#1171BB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">Clients by Plan</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={businessStats.clientsByPlan} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                {businessStats.clientsByPlan.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [`${v} clients`, name]} contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
            {businessStats.clientsByPlan.map((p, i) => (
              <div key={p.plan} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i] }} />
                <span style={{ color: 'var(--text-muted)' }}>{p.plan}</span>
                <span style={{ fontWeight: 700, color: 'var(--text)' }}>{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Revenue by Service (Share)</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {businessStats.topServices.map((s, i) => (
              <div key={s.service}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.service}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{s.percentage}%</span>
                </div>
                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                  <div style={{ width: `${s.percentage}%`, height: '100%', background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 3, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Employee Productivity</div>
        </div>
        <DataTable
          data={businessStats.employeeProductivity}
          columns={prodColumns}
          rowKey="name"
        />
      </div>
    </BusinessLayout>
  );
}
