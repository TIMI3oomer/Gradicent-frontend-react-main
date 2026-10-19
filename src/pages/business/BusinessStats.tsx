import { useState, useEffect } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { KPIGrid } from '../../components/business/KPIGrid';
import { RevenueChart } from '../../components/business/RevenueChart';
import { ErrorBanner, LoadingState } from '../../components/business/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, toRecord } from '../../components/business/apiHelpers';
import { countTrend, metricNumber, percentChangeTrend, pointChangeTrend } from '../../components/business/kpi';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { formatCurrency } from '../../lib/formatters';
import { DollarSign, Users, TrendingDown, ChartBar as BarChart3, Briefcase } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { BusinessStats as BusinessStatsData } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PIE_COLORS = ['#1171BB', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];
const tooltipStyle = { background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 };

type ProdRow = BusinessStatsData['employeeProductivity'][number];

const prodColumns: Column<ProdRow>[] = [
  { key: 'name', header: 'Employee', sortable: true, render: v => <span style={{ fontWeight: 600, fontSize: 13 }}>{v ? String(v) : '—'}</span> },
  { key: 'deals', header: 'Deals', align: 'right', sortable: true, render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{v ?? '—'}</span> },
  {
    key: 'revenue', header: 'Revenue Generated', align: 'right', sortable: true, render: v => (
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#22c55e', fontSize: 13 }}>{formatCurrency(v)}</span>
    ),
  },
  { key: 'satisfaction', header: 'CSAT', align: 'right', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{v === undefined || v === null ? '—' : `${v}%`}</span> },
  { key: 'completion', header: 'Task Completion', align: 'right', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v === undefined || v === null ? '—' : `${v}%`}</span> },
];

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function EmptyChart({ label }: { label: string }) {
  return <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 13 }}>{label}</div>;
}

export function BusinessStats() {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState<Partial<BusinessStatsData> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    let ignore = false;

    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const query = api.getContextQuery('business', userId);
        // Business metrics are computed by the Gaia engine on the backend
        const res = await api.safeFetch(`/api/gaia/compute${query}&metric=business_dashboard`);
        if (ignore) return;
        setStats(toRecord<Partial<BusinessStatsData>>(res) ?? {});
      } catch (err) {
        if (ignore) return;
        console.error('[Analytics] Error:', err);
        setStats(null);
        setError(`Analytics could not be loaded: ${errorMessage(err, 'unknown error')}`);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    fetchStats();
    return () => { ignore = true; };
  }, [user?.id, authLoading, reloadKey]);

  if (isLoading) {
    return (
      <BusinessLayout title="Analytics">
        <LoadingState label="Loading analytics..." padding="100px 0" />
      </BusinessLayout>
    );
  }

  if (error || !stats) {
    return (
      <BusinessLayout title="Analytics">
        <ErrorBanner message={error || 'Analytics could not be loaded.'} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />
      </BusinessLayout>
    );
  }

  const kpiItems = [
    { title: 'Total Revenue YTD', value: metricNumber(stats.totalRevenueYTD), prefix: '$', icon: <DollarSign size={18} /> },
    {
      title: 'Revenue This Month', value: metricNumber(stats.revenueThisMonth), prefix: '$',
      ...percentChangeTrend(stats.revenueThisMonth, stats.lastMonthRevenue, 'vs last month'), icon: <BarChart3 size={18} />,
    },
    { title: 'Active Clients', value: metricNumber(stats.activeClients), ...countTrend(stats.newClientsThisMonth, 'this month'), icon: <Users size={18} /> },
    {
      title: 'Churn Rate', value: metricNumber(stats.churnRate), unit: '%', decimals: 1,
      ...pointChangeTrend(stats.churnRate, stats.previousChurnRate, 'vs last month'), icon: <TrendingDown size={18} />,
    },
    { title: 'ROI', value: metricNumber(stats.roi), unit: '%', ...percentChangeTrend(stats.roi, stats.previousRoi, 'vs last quarter'), icon: <Briefcase size={18} /> },
  ];

  const revenueByMonth = asArray<BusinessStatsData['revenueByMonth'][number]>(stats.revenueByMonth);
  const topServices = asArray<BusinessStatsData['topServices'][number]>(stats.topServices);
  const clientsByPlan = asArray<BusinessStatsData['clientsByPlan'][number]>(stats.clientsByPlan);
  const productivity = asArray<ProdRow>(stats.employeeProductivity);

  return (
    <BusinessLayout title="Analytics">
      <KPIGrid items={kpiItems} columns={5} />

      <div className="two-col-wide" style={{ marginBottom: 20 }}>
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Revenue Trend</div>
              <div className="card-subtitle">Monthly revenue — current vs previous year</div>
            </div>
          </div>
          {revenueByMonth.length > 0 ? <RevenueChart data={revenueByMonth} height={260} /> : <EmptyChart label="No revenue recorded yet." />}
        </div>

        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <div className="card-title">Revenue by Service</div>
          </div>
          {topServices.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topServices} layout="vertical" margin={{ left: 8, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="service" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={110} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={tooltipStyle} />
                <Bar dataKey="revenue" fill="#1171BB" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart label="No service revenue recorded yet." />}
        </div>
      </div>

      {(clientsByPlan.length > 0 || topServices.length > 0) && (
        <div className="two-col" style={{ marginBottom: 20 }}>
          <div className="card" style={{ minWidth: 0 }}>
            <div className="card-header">
              <div className="card-title">Clients by Plan</div>
            </div>
            {clientsByPlan.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={clientsByPlan} dataKey="count" nameKey="plan" cx="50%" cy="50%" outerRadius={80} paddingAngle={3}>
                      {clientsByPlan.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number, name: string) => [`${v} clients`, name]} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                  {clientsByPlan.map((p, i) => (
                    <div key={p.plan ?? i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ color: 'var(--text-muted)' }}>{p.plan}</span>
                      <span style={{ fontWeight: 700, color: 'var(--text)' }}>{p.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyChart label="No plan breakdown available." />}
          </div>

          <div className="card" style={{ minWidth: 0 }}>
            <div className="card-header">
              <div className="card-title">Revenue Share by Service</div>
            </div>
            {topServices.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {topServices.map((s, i) => {
                  const pct = Math.max(0, Math.min(100, metricNumber(s.percentage)));
                  return (
                    <div key={s.service ?? i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: 'var(--text)', fontWeight: 500 }}>{s.service}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: PIE_COLORS[i % PIE_COLORS.length], borderRadius: 3, transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : <EmptyChart label="No service revenue recorded yet." />}
          </div>
        </div>
      )}

      {productivity.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">Employee Productivity</div>
          </div>
          <DataTable data={productivity} columns={prodColumns} rowKey="name" />
        </div>
      )}
    </BusinessLayout>
  );
}
