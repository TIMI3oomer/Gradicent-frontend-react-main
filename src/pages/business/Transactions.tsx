import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Search } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { sortRows, type SortState } from '../../components/shared/DataTable/sortRows';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { ErrorBanner, LoadingState, UnavailableNotice } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, isMissingEndpoint, toArray, toNumber } from '../../components/shared/apiHelpers';
import { BUSINESS_ROUTES } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PAGE_SIZE = 12;
type TypeFilter = 'All' | 'Invoice' | 'Payment' | 'Refund' | 'Subscription';
type StatusFilter = 'All' | 'Paid' | 'Pending' | 'Failed' | 'Cancelled';

const sameText = (a: unknown, b: string) => String(a ?? '').toLowerCase() === b.toLowerCase();

export function Transactions() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Set if the API answers 404 (an older API version without GET /api/binder/transactions)
  const [unavailable, setUnavailable] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);

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

    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setUnavailable(false);
        const res = await api.fetchList<unknown>('/api/binder/transactions', {
          domain: 'business',
          user_id: userId,
        });
        if (ignore) return;
        setTransactions(toArray<Transaction>(res, 'transactions'));
      } catch (err) {
        if (ignore) return;
        setTransactions([]);
        if (isMissingEndpoint(err)) {
          setUnavailable(true);
        } else {
          console.error('[Transactions] Fetch error:', err);
          setError(errorMessage(err, 'Could not load transactions.'));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    fetchTransactions();
    return () => { ignore = true; };
  }, [user?.id, authLoading, reloadKey]);

  // Search is applied locally to the loaded list (there is no transactions search route)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = transactions.filter(t => {
      if (typeFilter !== 'All' && !sameText(t.type, typeFilter)) return false;
      if (statusFilter !== 'All' && !sameText(t.status, statusFilter)) return false;
      if (q && ![t.id, t.clientName, t.description, t.reference, t.invoiceNumber].some(v => String(v ?? '').toLowerCase().includes(q))) return false;
      return true;
    });
    return sortRows(rows, sort);
  }, [transactions, typeFilter, statusFilter, search, sort]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Aggregate Metrics computed locally; amounts may arrive as strings or be missing
  const totals = useMemo(() => {
    let paid = 0;
    let pending = 0;
    let refunds = 0;
    for (const t of transactions) {
      const amount = toNumber(t.amount);
      if (sameText(t.type, 'Refund')) refunds += Math.abs(amount);
      else if (sameText(t.status, 'Paid')) paid += amount;
      else if (sameText(t.status, 'Pending')) pending += amount;
    }
    return { paid, pending, refunds };
  }, [transactions]);

  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, search, sort]);

  const columns: Column<Transaction>[] = [
    { key: 'id', header: 'Reference', render: (v, row) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500 }}>{String(row.invoiceNumber ?? row.reference ?? v ?? '—')}</span> },
    { key: 'clientName', header: 'Client', sortable: true, render: v => (v ? String(v) : '—') },
    { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(v)}</span> },
    { key: 'type', header: 'Type', render: v => <span style={{ textTransform: 'capitalize', fontSize: 13 }}>{v ? String(v) : '—'}</span> },
    { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
    {
      key: 'amount', header: 'Amount', align: 'right', sortable: true, render: (v, row) => {
        const isRefund = sameText(row.type, 'Refund');
        return (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: isRefund ? 'var(--danger)' : 'var(--text)' }}>
            {isRefund ? '-' : ''}{formatCurrency(v === undefined || v === null || v === '' ? null : Math.abs(toNumber(v)))}
          </span>
        );
      },
    },
  ];

  const selectStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' };

  return (
    <BusinessLayout title="Transactions">
      {unavailable ? (
        <div className="card">
          <UnavailableNotice icon={<CreditCard size={32} />} title="Account-wide transaction history isn't available yet">
            You can still see each client's transactions from their profile.
            <div style={{ marginTop: 16 }}>
              <button type="button" className="btn-primary btn-sm" onClick={() => navigate(BUSINESS_ROUTES.CLIENTS)}>Go to Clients</button>
            </div>
          </UnavailableNotice>
        </div>
      ) : (
        <>
          <div className="biz-stat-row">
            {[
              { label: 'Total Collected', value: formatCurrency(totals.paid), color: '#22c55e' },
              { label: 'Pending', value: formatCurrency(totals.pending), color: '#f59e0b' },
              { label: 'Refunds', value: formatCurrency(totals.refunds), color: 'var(--danger)' },
            ].map(stat => (
              <div key={stat.label} className="card" style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>{isLoading ? '—' : stat.value}</div>
              </div>
            ))}
          </div>

          <div className="biz-toolbar-filters" style={{ marginBottom: 20, flex: 'none' }}>
            <div className="biz-search" style={{ maxWidth: 300 }}>
              <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="search"
                placeholder="Search transactions..."
                aria-label="Search transactions"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
              />
            </div>
            <select aria-label="Filter by type" value={typeFilter} onChange={e => setTypeFilter(e.target.value as TypeFilter)} style={selectStyle}>
              <option value="All">All Types</option>
              <option value="Invoice">Invoice</option>
              <option value="Payment">Payment</option>
              <option value="Refund">Refund</option>
              <option value="Subscription">Subscription</option>
            </select>
            <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} style={selectStyle}>
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

          {isLoading ? (
            <LoadingState label="Loading transactions..." padding={48} />
          ) : error ? null : (
            <div className="card" style={{ padding: 0 }}>
              <DataTable
                data={paginated}
                columns={columns}
                rowKey="id"
                sort={sort}
                onSortChange={setSort}
                emptyTitle={transactions.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
              />
            </div>
          )}

          {!isLoading && filtered.length > PAGE_SIZE && (
            <div style={{ marginTop: 16 }}>
              <Pagination page={page} pageSize={PAGE_SIZE} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </BusinessLayout>
  );
}
