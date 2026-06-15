import { useState, useMemo, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
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
        const res = await api.searchEntities<any>('/api/binder/transactions/search', { domain: 'business', user_id: user.id, query: '' });
        const results = res.data?.results || res.data || [];
        setTransactions(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('[Transactions] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTransactions();
  }, [user?.id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter(t => {
      const matchSearch = !q || t.clientName?.toLowerCase().includes(q) || (t.invoiceNumber ?? '').toLowerCase().includes(q) || t.reference?.toLowerCase().includes(q);
      const matchType = typeFilter === 'All' || t.type === typeFilter;
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [transactions, search, typeFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalPaid = filtered.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = filtered.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = filtered.filter(t => t.type === 'Refund').reduce((sum, t) => sum + t.amount, 0);

  const columns: Column<Transaction>[] = [
    { key: 'invoiceNumber', header: 'Invoice #', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)' }}>{String(v ?? '—')}</span> },
    { key: 'clientName', header: 'Client', sortable: true, render: v => <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{String(v)}</span> },
    { key: 'description', header: 'Description', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{String(v)}</span> },
    { key: 'type', header: 'Type', render: v => <span style={{ fontSize: 12, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>{String(v)}</span> },
    {
      key: 'amount', header: 'Amount', align: 'right', sortable: true, render: (v, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: row.type === 'Refund' ? 'var(--danger)' : '#22c55e' }}>
          {row.type === 'Refund' ? '-' : '+'}{formatCurrency(Number(v))}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> },
    { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(String(v), 'short')}</span> },
  ];

  return (
    <BusinessLayout title="Transactions">
      <div className="three-col" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Collected', value: formatCurrency(totalPaid), color: '#22c55e' },
          { label: 'Pending', value: formatCurrency(totalPending), color: '#f59e0b' },
          { label: 'Refunds', value: formatCurrency(totalRefunds), color: 'var(--danger)' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filter Row UI ... */}

      {isLoading ? (
         <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Compiling global ledger...</div>
      ) : (
         <div className="card" style={{ padding: 0 }}>
           <DataTable data={paginated} columns={columns} rowKey="id" emptyTitle="No transactions match your filters." />
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