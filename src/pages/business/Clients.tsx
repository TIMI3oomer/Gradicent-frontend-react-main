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
import { api } from '../../lib/api';

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
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);

  // Sync with Backend: Toggle between List and Search based on input presence
  useEffect(() => {
    const fetchClientsData = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        setError(null);
        
        let res;
        const cleanQuery = search.trim();

        if (!cleanQuery) {
          // Default state: standard GET list route
          res = await api.fetchList<any>('/api/binder/clients', {
            domain: 'business',
            user_id: user.id
          });
        } else {
          // User searching state: POST search route
          res = await api.searchEntities<any>('/api/binder/clients/search', {
            domain: 'business',
            user_id: user.id,
            query: cleanQuery
          });
        }

        // Unpack payload dynamically matching either listing wrapper or pure search arrays
        const results = res.data?.clients || res.data?.results || res.data || [];
        setClients(Array.isArray(results) ? results : []);
      } catch (err: any) {
        console.error('[Clients Workspace] Sync Error:', err);
        setError(err.message || 'Failed to populate clients workspace.');
      } finally {
        setIsLoading(false);
      }
    };

    // Simple 300ms debounce window to prevent continuous backend thrashing
    const delayDebounce = setTimeout(() => {
      fetchClientsData();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [user?.id, search]);

  // Client side structural categorizations
  const filtered = useMemo(() => {
    return clients.filter(c => {
      if (planFilter !== 'All' && (c.plan || '').toLowerCase() !== planFilter.toLowerCase()) return false;
      return true;
    });
  }, [clients, planFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => { setPage(1); }, [planFilter, search]);

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client / Company',
      sortable: true,
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate(`${BUSINESS_ROUTES.CLIENTS}/${row.id}`)}>
          <Avatar src={(row as any).avatar} name={String(v)} size="md" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{String(v)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'industry', header: 'Industry', sortable: true },
    { key: 'plan', header: 'Tier', render: v => <PlanBadge plan={v as any} /> },
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> },
    { key: 'mrr', header: 'MRR', align: 'right', sortable: true, render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(Number(v))}</span> },
    { key: 'lastInteraction', header: 'Last Touchpoint', sortable: true, render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(String(v))}</span> }
  ];

  return (
    <BusinessLayout title="Clients Workspace">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search clients across index..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
            />
          </div>
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value as any)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
          >
            <option value="All">All Tiers</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <button onClick={() => setView('table')} style={{ padding: 8, background: view === 'table' ? 'var(--surface)' : 'transparent', border: 0, color: view === 'table' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}><List size={16} /></button>
            <button onClick={() => setView('cards')} style={{ padding: 8, background: view === 'cards' ? 'var(--surface)' : 'transparent', border: 0, color: view === 'cards' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}><LayoutGrid size={16} /></button>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> Add Client</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 6, color: '#ef4444', marginBottom: 20, fontSize: 14 }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <span>Synchronizing clients database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users size={32} />} title="No Clients Found" description={search ? "No entries matched your custom query expressions." : "Get started by provisioning your business domain's first active client node."} />
      ) : (
        <>
          {view === 'table' ? (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <DataTable data={paginated} columns={columns} rowKey="id" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {paginated.map(c => (
                <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, cursor: 'pointer' }} onClick={() => navigate(`${BUSINESS_ROUTES.CLIENTS}/${c.id}`)}>
                  <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar src={c.avatar} name={c.name} size="lg" />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: 15 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                      </div>
                    </div>
                    <Badge status={c.status as any} size="sm" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PlanBadge plan={c.plan} size="sm" />
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