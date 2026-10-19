import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutGrid, List, Search, Plus } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { sortRows, type SortState } from '../../components/shared/DataTable/sortRows';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { PlanBadge } from '../../components/business/PlanBadge';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, toArray } from '../../components/shared/apiHelpers';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { BUSINESS_ROUTES } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Client } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PAGE_SIZE = 10;
type PlanFilter = 'All' | 'Basic' | 'Pro' | 'Enterprise';

export function Clients() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  // Live Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Filter State
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<PlanFilter>('All');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);

  // Sync with Backend: GET list when the search box is empty, POST search otherwise
  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    // Ignore responses from earlier keystrokes that resolve after a newer request
    let ignore = false;

    const fetchClientsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cleanQuery = search.trim();
        const res = cleanQuery
          ? await api.searchEntities<unknown>('/api/binder/client/search', {
              domain: 'business',
              user_id: userId,
              query: cleanQuery,
            })
          : await api.fetchList<unknown>('/api/binder/clients', {
              domain: 'business',
              user_id: userId,
            });

        if (ignore) return;
        setClients(toArray<Client>(res, 'clients'));
      } catch (err) {
        if (ignore) return;
        console.error('[Clients] Fetch error:', err);
        setClients([]);
        setError(errorMessage(err, 'Could not load your clients.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    // Simple 300ms debounce window to prevent continuous backend thrashing
    const delayDebounce = setTimeout(fetchClientsData, 300);

    return () => {
      ignore = true;
      clearTimeout(delayDebounce);
    };
  }, [user?.id, authLoading, search, reloadKey]);

  // Client side structural categorizations
  const filtered = useMemo(() => {
    const rows = clients.filter(c => {
      if (planFilter !== 'All' && String(c.plan ?? '').toLowerCase() !== planFilter.toLowerCase()) return false;
      return true;
    });
    return sortRows(rows, sort);
  }, [clients, planFilter, sort]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => { setPage(1); }, [planFilter, search, sort]);

  const openClient = (id: string) => navigate(`${BUSINESS_ROUTES.CLIENTS}/${encodeURIComponent(id)}`);

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client / Company',
      sortable: true,
      render: (v, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{v ? String(v) : '—'}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.email}</div>
        </div>
      ),
    },
    { key: 'industry', header: 'Industry', sortable: true, render: v => (v ? String(v) : '—') },
    { key: 'plan', header: 'Tier', render: v => (v ? <PlanBadge plan={v as Client['plan']} /> : '—') },
    { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
    { key: 'mrr', header: 'MRR', align: 'right', sortable: true, render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(v)}</span> },
    { key: 'lastInteraction', header: 'Last Contact', sortable: true, render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(v)}</span> },
  ];

  const toggleBtnStyle = (active: boolean) => ({
    padding: 8, background: active ? 'var(--surface)' : 'transparent', border: 0,
    color: active ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer',
  });

  return (
    <BusinessLayout title="Clients">
      <div className="biz-toolbar">
        <div className="biz-toolbar-filters">
          <div className="biz-search">
            <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="search"
              placeholder="Search clients..."
              aria-label="Search clients"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
            />
          </div>
          <select
            value={planFilter}
            aria-label="Filter by plan"
            onChange={e => setPlanFilter(e.target.value as PlanFilter)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
          >
            <option value="All">All Plans</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }} role="group" aria-label="View">
            <button type="button" aria-label="Table view" aria-pressed={view === 'table'} onClick={() => setView('table')} style={toggleBtnStyle(view === 'table')}><List size={16} aria-hidden="true" /></button>
            <button type="button" aria-label="Card view" aria-pressed={view === 'cards'} onClick={() => setView('cards')} style={toggleBtnStyle(view === 'cards')}><LayoutGrid size={16} aria-hidden="true" /></button>
          </div>
          <button
            type="button"
            onClick={() => navigate(BUSINESS_ROUTES.CLIENTS_ADD)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}
          >
            <Plus size={16} aria-hidden="true" /> Add Client
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

      {isLoading ? (
        <LoadingState label="Loading clients..." />
      ) : error ? null : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No clients found"
          description={search || planFilter !== 'All' ? 'No clients match your search or filters.' : 'Add your first client to get started.'}
        />
      ) : (
        <>
          {view === 'table' ? (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <DataTable data={paginated} columns={columns} rowKey="id" onRowClick={row => openClient(row.id)} sort={sort} onSortChange={setSort} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 16 }}>
              {paginated.map(c => (
                <div
                  key={c.id}
                  className="card biz-clickable"
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${c.name || 'client'}`}
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                  onClick={() => openClient(c.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openClient(c.id); }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{c.name || '—'}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
                    </div>
                    <Badge status={c.status as BadgeVariant} size="sm" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {c.plan && <PlanBadge plan={c.plan} size="sm" />}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.industry}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revenue YTD</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', fontFamily: 'var(--font-mono)' }}>{formatCurrency(c.revenueYTD)}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase' }}>MRR</div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(c.mrr)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length > PAGE_SIZE && (
            <div style={{ marginTop: 16 }}>
              <Pagination page={page} pageSize={PAGE_SIZE} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </BusinessLayout>
  );
}
