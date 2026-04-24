import { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { mockTransactions } from '../../data/transactions';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Transaction } from '../../types';

const PAGE_SIZE = 12;

export function Transactions() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Invoice' | 'Payment' | 'Refund' | 'Subscription'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Pending' | 'Failed' | 'Cancelled'>('All');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockTransactions.filter(t => {
      const matchSearch = !q || t.clientName.toLowerCase().includes(q) || (t.invoiceNumber ?? '').toLowerCase().includes(q) || t.reference.toLowerCase().includes(q);
      const matchType = typeFilter === 'All' || t.type === typeFilter;
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalPaid = filtered.filter(t => t.status === 'Paid').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = filtered.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
  const totalRefunds = filtered.filter(t => t.type === 'Refund').reduce((sum, t) => sum + t.amount, 0);

  const columns: Column<Transaction>[] = [
    {
      key: 'invoiceNumber', header: 'Invoice #', render: v => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--primary)' }}>{String(v ?? '—')}</span>
      ),
    },
    {
      key: 'clientName', header: 'Client', sortable: true, render: v => (
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{String(v)}</span>
      ),
    },
    {
      key: 'description', header: 'Description', render: v => (
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{String(v)}</span>
      ),
    },
    { key: 'type', header: 'Type', render: v => <span style={{ fontSize: 12, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>{String(v)}</span> },
    {
      key: 'amount', header: 'Amount', align: 'right', sortable: true, render: (v, row) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13, color: row.type === 'Refund' ? 'var(--danger)' : '#22c55e' }}>
          {row.type === 'Refund' ? '-' : '+'}{formatCurrency(v as number)}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Paid' | 'Pending' | 'Failed' | 'Cancelled'} size="sm" /> },
    { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(v as string, 'short')}</span> },
  ];

  return (
    <BusinessLayout title="Transactions">
      {/* Summary bar */}
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

      <div className="filter-row" style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, height: 36 }}
            placeholder="Search transactions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Invoice', 'Payment', 'Refund', 'Subscription'] as const).map(t => (
            <button key={t} className={typeFilter === t ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => { setTypeFilter(t); setPage(1); }}>{t}</button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Paid', 'Pending', 'Failed', 'Cancelled'] as const).map(s => (
            <button key={s} className={statusFilter === s ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</button>
          ))}
        </div>

        <button className="btn-ghost btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''} found
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DataTable
          data={paginated}
          columns={columns}
          rowKey="id"
          emptyTitle="No transactions match your filters."
        />
      </div>

      {filtered.length > PAGE_SIZE && (
        <div style={{ marginTop: 16 }}>
          <Pagination page={page} pageSize={PAGE_SIZE} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      )}
    </BusinessLayout>
  );
}
