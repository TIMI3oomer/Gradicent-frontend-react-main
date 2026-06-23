import { useState, useMemo, useEffect } from 'react';
import { Search } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Transaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PAGE_SIZE = 12;

export function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Invoice' | 'Payment' | 'Refund' | 'Subscription'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Failed' | 'Cancelled'>('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        
        let res;
        const cleanQuery = search.trim();

        if (!cleanQuery) {
          // Fall back to general list route when empty
          res = await api.fetchList<any>('/api/binder/transactions', {
            domain: 'business',
            user_id: user.id
          });
        } else {
          // Direct POST search parameter payload routing
          res = await api.searchEntities<any>('/api/binder/transactions/search', {
            domain: 'business',
            user_id: user.id,
            query: cleanQuery
          });
        }

        const results = res.data?.transactions || res.data?.results || res.data || [];
        setTransactions(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('[Transactions Ledger] Synchronize issue:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchTransactions();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [user?.id, search]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (typeFilter !== 'All' && t.type !== typeFilter) return false;
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      return true;
    });
  }, [transactions, typeFilter, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  // Aggregate Metrics computed locally
  const totalPaid = useMemo(() => transactions.filter(t => t.status === 'Paid').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalPending = useMemo(() => transactions.filter(t => t.status === 'Pending').reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalRefunds = useMemo(() => transactions.filter(t => t.type === 'Refund').reduce((s, t) => s + t.amount, 0), [transactions]);

  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, search]);

  const columns: Column<Transaction>[] = [
    { key: 'id', header: 'Reference ID', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500 }}>{String(v)}</span> },
    { key: 'clientName', header: 'Client' },
    { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{formatDate(String(v))}</span> },
    { key: 'type', header: 'Type', render: v => <span style={{ textTransform: 'capitalize', fontSize: 13 }}>{String(v)}</span> },
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> },
    {
      key: 'amount', header: 'Amount', align: 'right', sortable: true, render: (v, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: row.type === 'Refund' ? 'var(--danger)' : 'var(--text)' }}>
          {row.type === 'Refund' ? '-' : ''}{formatCurrency(Number(v))}
        </span>
      )
    }
  ];

  return (
    <BusinessLayout title="Transactions Ledger">
      <div className="three-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Collected', value: formatCurrency(totalPaid), color: '#22c55e' },
          { label: 'Pending', value: formatCurrency(totalPending), color: '#f59e0b' },
          { label: 'Refunds', value: formatCurrency(totalRefunds), color: 'var(--danger)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', maxWidth: 300, flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Find transaction ledger..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}
          />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value as any)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}>
          <option value="All">All Types</option>
          <option value="Invoice">Invoice</option>
          <option value="Payment">Payment</option>
          <option value="Refund">Refund</option>
          <option value="Subscription">Subscription</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}>
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {isLoading ? (
         <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Compiling global ledger...</div>
      ) : (
         <div className="card" style={{ padding: 0 }}>
           <DataTable data={paginated} columns={columns} rowKey="id" />
         </div>
      )}

      {filtered.length > PAGE_SIZE && (
        <div style={{ marginTop: 16 }}>
          <Pagination page={page} pageSize={PAGE_SIZE} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      )}
    </BusinessLayout>
  );
}