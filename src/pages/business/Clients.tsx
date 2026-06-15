import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LayoutGrid, List, Search, Plus } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { PlanBadge } from '../../components/business/PlanBadge';
import { Avatar } from '../../components/shared/Avatar';
import { EmptyState } from '../../components/shared/EmptyState';
import { Pagination } from '../../components/shared/Pagination';
import { BUSINESS_ROUTES } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Client } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api'; // <-- Using your clean API client

const PAGE_SIZE = 10;

export function Clients() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Live Data State
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | 'Basic' | 'Pro' | 'Enterprise'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Churned' | 'Lead'>('All');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);

  // Fetch from live Binder Search Endpoint
  useEffect(() => {
    const fetchClients = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        // Uses your unified search endpoint via the api.ts wrapper
        const response = await api.searchEntities<any>('/api/binder/client/search', {
          domain: 'business',
          user_id: user.id,
          query: '' // Empty query returns all available clients
        });

        // Resolve data depending on your search endpoint's envelope return structure
        const results = response.data?.results || response.data || response;
        setClients(Array.isArray(results) ? results : []);
        setError(null);
      } catch (err: any) {
        console.error('[Clients] Fetch Error:', err);
        setError(err.message || 'Failed to load client directory.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, [user?.id]);

  const filtered = useMemo(() => {
    return clients.filter(c => {
      const q = search.toLowerCase();
      const matchSearch = !q || c.name.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
      const matchPlan = planFilter === 'All' || c.plan === planFilter;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchPlan && matchStatus;
    });
  }, [clients, search, planFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<Client>[] = [
    {
      key: 'name', header: 'Client', sortable: true, render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={String(v)} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{String(v)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.company || '—'}</div>
          </div>
        </div>
      ),
    },
    { key: 'plan', header: 'Plan', render: v => <PlanBadge plan={v as any} size="sm" /> },
    {
      key: 'revenueYTD', header: 'Revenue YTD', align: 'right', sortable: true, render: v => (
        <span style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: '#22c55e', fontSize: 13 }}>
          {formatCurrency(Number(v))}
        </span>
      ),
    },
    {
      key: 'mrr', header: 'MRR', align: 'right', sortable: true, render: v => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-muted)' }}>
          {formatCurrency(Number(v))}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> },
    {
      key: 'id', header: '', align: 'right', render: (_, row) => (
        <button className="btn-ghost btn-sm" onClick={e => { e.stopPropagation(); navigate(`/business/clients/${row.id}`); }}>View</button>
      ),
    },
  ];

  return (
    <BusinessLayout title="Clients">
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, height: 36 }}
            placeholder="Search clients..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Basic', 'Pro', 'Enterprise'] as const).map(p => (
            <button key={p} className={planFilter === p ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => { setPlanFilter(p); setPage(1); }}>{p}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Active', 'Churned', 'Lead'] as const).map(s => (
            <button key={s} className={statusFilter === s ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
            <button className={view === 'table' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setView('table')} style={{ padding: '4px 8px' }}><List size={14} /></button>
            <button className={view === 'cards' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setView('cards')} style={{ padding: '4px 8px' }}><LayoutGrid size={14} /></button>
          </div>
          <button className="btn-primary btn-sm" onClick={() => navigate(BUSINESS_ROUTES.CLIENTS_ADD)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Add Client
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Retrieving client directory...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--danger)' }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            {filtered.length} client{filtered.length !== 1 ? 's' : ''} found
          </div>

          {view === 'table' ? (
            <>
              <div className="card" style={{ padding: 0 }}>
                <DataTable
                  data={paginated}
                  columns={columns}
                  onRowClick={row => navigate(`/business/clients/${(row as Client).id}`)}
                  rowKey="id"
                  emptyTitle="No clients match your filters."
                />
              </div>
            </>
          ) : (
            <>
              {paginated.length === 0 ? (
                <EmptyState icon={<Users size={32} />} title="No clients found" description="Try adjusting your search or filters." />
              ) : (
                <div className="three-col">
                  {paginated.map(c => (
                    <div
                      key={c.id}
                      className="card"
                      style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                      onClick={() => navigate(`/business/clients/${c.id}`)}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={c.name} size="md" />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.company}</div>
                          </div>
                        </div>
                        <Badge status={c.status} size="sm" />
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                        <PlanBadge plan={c.plan} size="sm" />
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.industry}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Revenue YTD</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#22c55e', fontFamily: 'var(--font-mono)' }}>{formatCurrency(c.revenueYTD)}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>MRR</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(c.mrr)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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