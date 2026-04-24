import { useState, useMemo } from 'react';
import { Search, Download, Database } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { mockTransactions } from '../../data/transactions';
import { mockClients } from '../../data/clients';
import { mockAppointments } from '../../data/appointments';
import { formatCurrency, formatDate } from '../../lib/formatters';

const PAGE_SIZE = 15;

type DatasetKey = 'transactions' | 'clients' | 'appointments';

export function BusinessData() {
  const [dataset, setDataset] = useState<DatasetKey>('transactions');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const datasets: { key: DatasetKey; label: string; count: number }[] = [
    { key: 'transactions', label: 'Transactions', count: mockTransactions.length },
    { key: 'clients', label: 'Clients', count: mockClients.length },
    { key: 'appointments', label: 'Appointments', count: mockAppointments.filter(a => a.type === 'Business').length },
  ];

  const rawData = useMemo(() => {
    if (dataset === 'transactions') return mockTransactions;
    if (dataset === 'clients') return mockClients;
    return mockAppointments.filter(a => a.type === 'Business');
  }, [dataset]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return rawData;
    return rawData.filter(row => JSON.stringify(row).toLowerCase().includes(q));
  }, [rawData, search]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const txnCols: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{String(v)}</span> },
    { key: 'clientName', header: 'Client', render: v => <span style={{ fontWeight: 600, fontSize: 13 }}>{String(v)}</span> },
    { key: 'type', header: 'Type', render: v => <span style={{ fontSize: 12 }}>{String(v)}</span> },
    { key: 'amount', header: 'Amount', align: 'right', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#22c55e' }}>{formatCurrency(v as number)}</span> },
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Paid' | 'Pending' | 'Failed' | 'Cancelled'} size="sm" /> },
    { key: 'date', header: 'Date', render: v => <span style={{ fontSize: 12 }}>{formatDate(v as string, 'short')}</span> },
    { key: 'reference', header: 'Reference', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{String(v)}</span> },
  ];

  const clientCols: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{String(v)}</span> },
    { key: 'name', header: 'Name', sortable: true, render: v => <span style={{ fontWeight: 600, fontSize: 13 }}>{String(v)}</span> },
    { key: 'company', header: 'Company', render: v => <span style={{ fontSize: 12 }}>{String(v)}</span> },
    { key: 'plan', header: 'Plan', render: v => <span style={{ fontSize: 12, fontWeight: 600 }}>{String(v)}</span> },
    { key: 'revenueYTD', header: 'Revenue YTD', align: 'right', sortable: true, render: v => <span style={{ fontFamily: 'var(--font-mono)', color: '#22c55e', fontWeight: 700 }}>{formatCurrency(v as number)}</span> },
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Active' | 'Churned' | 'Lead'} size="sm" /> },
    { key: 'joinDate', header: 'Join Date', render: v => <span style={{ fontSize: 12 }}>{formatDate(v as string, 'short')}</span> },
  ];

  const aptCols: Column<Record<string, unknown>>[] = [
    { key: 'id', header: 'ID', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{String(v)}</span> },
    { key: 'title', header: 'Title', render: v => <span style={{ fontWeight: 600, fontSize: 13 }}>{String(v)}</span> },
    { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 12 }}>{formatDate(v as string, 'short')}</span> },
    { key: 'time', header: 'Time', render: v => <span style={{ fontSize: 12 }}>{String(v)}</span> },
    { key: 'attendeeName', header: 'Attendee', render: v => <span style={{ fontSize: 12 }}>{String(v)}</span> },
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Scheduled' | 'Completed' | 'Cancelled'} size="sm" /> },
    { key: 'location', header: 'Location', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{String(v)}</span> },
  ];

  const cols = dataset === 'transactions' ? txnCols : dataset === 'clients' ? clientCols : aptCols;

  return (
    <BusinessLayout title="Data Explorer">
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {datasets.map(ds => (
          <button
            key={ds.key}
            onClick={() => { setDataset(ds.key); setSearch(''); setPage(1); }}
            className={dataset === ds.key ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Database size={13} />
            {ds.label}
            <span style={{ background: dataset === ds.key ? 'rgba(255,255,255,0.25)' : 'var(--border)', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
              {ds.count}
            </span>
          </button>
        ))}
      </div>

      <div className="filter-row" style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: '0 0 300px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, height: 36 }}
            placeholder={`Search ${dataset}...`}
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>{filtered.length} records</div>
          <button className="btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <DataTable
          data={paginated as unknown as Record<string, unknown>[]}
          columns={cols}
          rowKey="id"
          emptyTitle="No records match your search."
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
