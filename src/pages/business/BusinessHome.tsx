import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingDown, ChartBar as BarChart3 } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { KPIGrid } from '../../components/business/KPIGrid';
import { RevenueChart } from '../../components/business/RevenueChart';
import { ErrorBanner, LoadingState } from '../../components/business/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, isMissingEndpoint, toArray, toNumber, toRecord } from '../../components/business/apiHelpers';
import { countTrend, metricNumber, percentChangeTrend, pointChangeTrend } from '../../components/business/kpi';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { PlanBadge } from '../../components/business/PlanBadge';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { BUSINESS_ROUTES } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { BusinessStats, Client, Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

type ClientRow = { rank: number; name: string; company: string; plan: Client['plan']; revenueYTD: number; status: string; id: string };
type SectionState<T> = { data: T; error: string | null; unavailable?: boolean };

export function BusinessHome() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [stats, setStats] = useState<Partial<BusinessStats> | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentTxns, setRecentTxns] = useState<SectionState<Transaction[]>>({ data: [], error: null });
  const [topClients, setTopClients] = useState<SectionState<ClientRow[]>>({ data: [], error: null });
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setStatsError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    let ignore = false;

    const fetchDashboardContext = async () => {
      setIsLoading(true);
      setStatsError(null);
      const query = api.getContextQuery('business', userId);
      const context = { domain: 'business', user_id: userId };

      // Each section loads independently so one failing endpoint doesn't blank the whole dashboard
      const [statsRes, txnsRes, clientsRes] = await Promise.allSettled([
        api.safeFetch(`/api/gaia/compute${query}&metric=business_dashboard`),
        api.fetchList<unknown>('/api/binder/transactions', context),
        api.fetchList<unknown>('/api/binder/clients', context),
      ]);
      if (ignore) return;

      if (statsRes.status === 'fulfilled') {
        setStats(toRecord<Partial<BusinessStats>>(statsRes.value) ?? {});
      } else {
        console.error('[Dashboard] Metrics error:', statsRes.reason);
        setStats(null);
        setStatsError(`Dashboard metrics could not be loaded: ${errorMessage(statsRes.reason, 'unknown error')}`);
      }

      if (txnsRes.status === 'fulfilled') {
        setRecentTxns({ data: toArray<Transaction>(txnsRes.value, 'transactions').slice(0, 6), error: null });
      } else if (isMissingEndpoint(txnsRes.reason)) {
        setRecentTxns({ data: [], error: null, unavailable: true });
      } else {
        setRecentTxns({ data: [], error: errorMessage(txnsRes.reason, 'Could not load recent transactions.') });
      }

      if (clientsRes.status === 'fulfilled') {
        const top = toArray<Client>(clientsRes.value, 'clients')
          .filter(c => String(c.status ?? '').toLowerCase() === 'active')
          .sort((a, b) => toNumber(b.revenueYTD) - toNumber(a.revenueYTD))
          .slice(0, 5)
          .map((c, i) => ({ rank: i + 1, name: c.name, company: c.company, plan: c.plan, revenueYTD: toNumber(c.revenueYTD), status: c.status, id: c.id }));
        setTopClients({ data: top, error: null });
      } else {
        setTopClients({ data: [], error: errorMessage(clientsRes.reason, 'Could not load clients.') });
      }

      setIsLoading(false);
    };

    fetchDashboardContext();
    return () => { ignore = true; };
  }, [user?.id, authLoading, reloadKey]);

  const retry = user?.id ? () => setReloadKey(k => k + 1) : undefined;

  if (isLoading) {
    return (
      <BusinessLayout title="Dashboard">
        <LoadingState label="Loading your dashboard..." padding="100px 0" />
      </BusinessLayout>
    );
  }

  const kpiItems = stats ? [
    {
      title: 'Revenue This Month', value: metricNumber(stats.revenueThisMonth), prefix: '$',
      ...percentChangeTrend(stats.revenueThisMonth, stats.lastMonthRevenue, 'vs last month'), icon: <DollarSign size={18} />,
    },
    {
      title: 'Active Clients', value: metricNumber(stats.activeClients),
      ...countTrend(stats.newClientsThisMonth, 'new this month'), icon: <Users size={18} />,
    },
    {
      title: 'Churn Rate', value: metricNumber(stats.churnRate), unit: '%', decimals: 1,
      ...pointChangeTrend(stats.churnRate, stats.previousChurnRate, 'vs last month'), icon: <TrendingDown size={18} />,
    },
    {
      title: 'ROI', value: metricNumber(stats.roi), unit: '%',
      ...percentChangeTrend(stats.roi, stats.previousRoi, 'vs last quarter'), icon: <BarChart3 size={18} />,
    },
  ] : [];

  const clientColumns: Column<ClientRow>[] = [
    { key: 'rank', header: '#', width: '40px', align: 'center' },
    { key: 'name', header: 'Client', sortable: true, render: (v, row) => (
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{v ? String(v) : '—'}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.company}</div>
      </div>
    )},
    { key: 'plan', header: 'Plan', render: v => (v ? <PlanBadge plan={v as Client['plan']} size="sm" /> : '—') },
    { key: 'revenueYTD', header: 'Revenue YTD', align: 'right', sortable: true, render: v => (
      <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#22c55e' }}>
        {formatCurrency(v)}
      </span>
    )},
    { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
    { key: 'id', header: '', align: 'right', render: (_, row) => (
      <button
        className="btn-ghost btn-sm"
        aria-label={`View ${row.name || 'client'}`}
        onClick={e => {
          // The row itself is clickable too; don't navigate twice
          e.stopPropagation();
          navigate(`${BUSINESS_ROUTES.CLIENTS}/${encodeURIComponent(row.id)}`);
        }}
      >
        View
      </button>
    )},
  ];

  const revenueByMonth = stats && Array.isArray(stats.revenueByMonth) ? stats.revenueByMonth : [];

  return (
    <BusinessLayout title="Dashboard">
      {statsError && <ErrorBanner message={statsError} onRetry={retry} />}

      {kpiItems.length > 0 && <KPIGrid items={kpiItems} />}

      <div className="two-col-wide" style={{ marginBottom: 20 }}>
        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Revenue</div>
              <div className="card-subtitle">Monthly revenue — current vs previous year</div>
            </div>
          </div>
          {revenueByMonth.length > 0 ? (
            <RevenueChart data={revenueByMonth} height={260} />
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 0', fontSize: 13 }}>
              {stats ? 'No revenue recorded yet.' : 'Revenue data is unavailable right now.'}
            </div>
          )}
        </div>

        <div className="card" style={{ minWidth: 0 }}>
          <div className="card-header">
            <div className="card-title">Recent Transactions</div>
            {!recentTxns.unavailable && (
              <button className="btn-ghost btn-sm" onClick={() => navigate(BUSINESS_ROUTES.TRANSACTIONS)}>View all</button>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentTxns.error ? (
              <ErrorBanner message={recentTxns.error} onRetry={retry} />
            ) : recentTxns.unavailable ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: 13 }}>
                Account-wide transaction history isn't available yet. Open a client to see their transactions.
              </div>
            ) : recentTxns.data.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>No recent activity.</div>
            ) : (
              recentTxns.data.map((txn, i) => {
                const isRefund = String(txn.type ?? '').toLowerCase() === 'refund';
                return (
                  <motion.div
                    key={txn.id ?? i}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < recentTxns.data.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{txn.clientName || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{txn.type || '—'} · {formatDate(txn.date, 'short')}</div>
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: isRefund ? 'var(--danger)' : 'var(--success)', textAlign: 'right' }}>
                      {isRefund ? '-' : '+'}{formatCurrency(Math.abs(toNumber(txn.amount)))}
                    </div>
                    <Badge status={txn.status as BadgeVariant} size="sm" />
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Top Clients by Revenue</div>
          <button className="btn-ghost btn-sm" onClick={() => navigate(BUSINESS_ROUTES.CLIENTS)}>View all clients</button>
        </div>
        {topClients.error ? (
          <ErrorBanner message={topClients.error} onRetry={retry} />
        ) : (
          <DataTable
            data={topClients.data}
            columns={clientColumns}
            onRowClick={row => navigate(`${BUSINESS_ROUTES.CLIENTS}/${encodeURIComponent(row.id)}`)}
            rowKey="id"
            emptyTitle="No active clients yet"
          />
        )}
      </div>
    </BusinessLayout>
  );
}
