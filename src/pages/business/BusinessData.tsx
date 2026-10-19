import { useState, useMemo, useEffect } from 'react';
import { Search, Download, Database } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { sortRows, type SortState } from '../../components/shared/DataTable/sortRows';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { ErrorBanner, LoadingState, UnavailableNotice } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, isMissingEndpoint, toArray } from '../../components/shared/apiHelpers';
import { formatCurrency, formatDate, toLocalIsoDate } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PAGE_SIZE = 15;
type DatasetKey = 'transactions' | 'clients' | 'appointments';
type Row = Record<string, unknown>;

const DATASETS: { key: DatasetKey; label: string; endpoint: string; listKey: string }[] = [
  { key: 'transactions', label: 'Transactions', endpoint: '/api/binder/transactions', listKey: 'transactions' },
  { key: 'clients', label: 'Clients', endpoint: '/api/binder/clients', listKey: 'clients' },
  { key: 'appointments', label: 'Appointments', endpoint: '/api/binder/appointments', listKey: 'appointments' },
];

const text = (v: unknown) => (v === undefined || v === null || v === '' ? '—' : String(v));

const txnCols: Column<Row>[] = [
  { key: 'id', header: 'ID', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{text(v)}</span> },
  { key: 'clientName', header: 'Client', sortable: true, render: v => <span style={{ fontWeight: 600, fontSize: 13 }}>{text(v)}</span> },
  { key: 'type', header: 'Type', render: v => <span style={{ fontSize: 12 }}>{text(v)}</span> },
  { key: 'amount', header: 'Amount', align: 'right', sortable: true, render: v => <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#22c55e' }}>{formatCurrency(v as number | string | null | undefined)}</span> },
  { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
  { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 12 }}>{formatDate(v as string | undefined, 'short')}</span> },
  { key: 'reference', header: 'Reference', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{text(v)}</span> },
];

const clientCols: Column<Row>[] = [
  { key: 'id', header: 'ID', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{text(v)}</span> },
  { key: 'name', header: 'Name', sortable: true, render: v => <span style={{ fontWeight: 600, fontSize: 13 }}>{text(v)}</span> },
  { key: 'company', header: 'Company', render: v => <span style={{ fontSize: 12 }}>{text(v)}</span> },
  { key: 'plan', header: 'Plan', render: v => <span style={{ fontSize: 12, fontWeight: 600 }}>{text(v)}</span> },
  { key: 'revenueYTD', header: 'Revenue YTD', align: 'right', sortable: true, render: v => <span style={{ fontFamily: 'var(--font-mono)', color: '#22c55e', fontWeight: 700 }}>{formatCurrency(v as number | string | null | undefined)}</span> },
  { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
  { key: 'joinDate', header: 'Join Date', sortable: true, render: v => <span style={{ fontSize: 12 }}>{formatDate(v as string | undefined, 'short')}</span> },
];

const aptCols: Column<Row>[] = [
  { key: 'id', header: 'ID', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{text(v)}</span> },
  { key: 'title', header: 'Title', render: v => <span style={{ fontWeight: 600, fontSize: 13 }}>{text(v)}</span> },
  { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 12 }}>{formatDate(v as string | undefined, 'short')}</span> },
  { key: 'time', header: 'Time', render: v => <span style={{ fontSize: 12 }}>{text(v)}</span> },
  { key: 'attendeeName', header: 'Attendee', render: v => <span style={{ fontSize: 12 }}>{text(v)}</span> },
  { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
  { key: 'location', header: 'Location', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{text(v)}</span> },
];

const COLUMNS: Record<DatasetKey, Column<Row>[]> = { transactions: txnCols, clients: clientCols, appointments: aptCols };

function csvCell(value: unknown) {
  const s = value === undefined || value === null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Downloads the given rows as CSV, using the visible column keys as headers. */
function exportCsv(rows: Row[], columns: Column<Row>[], name: string) {
  const keys = columns.map(c => String(c.key));
  const lines = [columns.map(c => csvCell(c.header)).join(','), ...rows.map(r => keys.map(k => csvCell(r[k])).join(','))];
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}-${toLocalIsoDate()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function BusinessData() {
  const { user, isLoading: authLoading } = useAuth();

  const [dataset, setDataset] = useState<DatasetKey>('clients');
  const [rawData, setRawData] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);

  // Re-fetch the selected dataset whenever the tab changes (always a GET list route —
  // the binder search routes reject an empty query)
  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    const config = DATASETS.find(d => d.key === dataset) ?? DATASETS[0];
    let ignore = false;

    const loadDataset = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setUnavailable(false);
        const res = await api.fetchList<unknown>(config.endpoint, { domain: 'business', user_id: userId });
        if (ignore) return;
        setRawData(toArray<Row>(res, config.listKey));
      } catch (err) {
        if (ignore) return;
        setRawData([]);
        if (isMissingEndpoint(err)) {
          setUnavailable(true);
        } else {
          console.error(`[Data Explorer] Failed loading ${dataset}:`, err);
          setError(errorMessage(err, `Could not load ${config.label.toLowerCase()}.`));
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    loadDataset();
    return () => { ignore = true; };
  }, [dataset, user?.id, authLoading, reloadKey]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = q ? rawData.filter(row => JSON.stringify(row).toLowerCase().includes(q)) : rawData;
    return sortRows(rows, sort);
  }, [rawData, search, sort]);

  useEffect(() => { setPage(1); }, [search, sort]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const cols = COLUMNS[dataset];
  const activeLabel = DATASETS.find(d => d.key === dataset)?.label ?? '';

  const selectDataset = (key: DatasetKey) => {
    if (key === dataset) return;
    setDataset(key);
    setSearch('');
    setSort(null);
    setPage(1);
  };

  return (
    <BusinessLayout title="Data Explorer">
      <div className="biz-tabs" role="tablist" aria-label="Datasets" style={{ borderBottom: 'none', gap: 12 }}>
        {DATASETS.map(ds => {
          const active = dataset === ds.key;
          return (
            <button
              key={ds.key}
              role="tab"
              aria-selected={active}
              onClick={() => selectDataset(ds.key)}
              className={active ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Database size={13} aria-hidden="true" />
              {ds.label}
              {active && !isLoading && !unavailable && !error && (
                <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>
                  {rawData.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {unavailable ? (
        <div className="card">
          <UnavailableNotice icon={<Database size={32} />} title={`${activeLabel} can't be explored yet`}>
            This dataset isn't available from the server yet. Try the Clients dataset in the meantime.
          </UnavailableNotice>
        </div>
      ) : (
        <>
          <div className="filter-row" style={{ marginBottom: 16 }}>
            <div className="biz-search" style={{ maxWidth: 300 }}>
              <Search size={14} aria-hidden="true" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="search"
                className="form-input"
                style={{ paddingLeft: 32, height: 36 }}
                placeholder={`Search ${activeLabel.toLowerCase()}...`}
                aria-label={`Search ${activeLabel.toLowerCase()}`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }} aria-live="polite">{isLoading ? '' : `${filtered.length} records`}</div>
              <button
                type="button"
                className="btn-ghost btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                disabled={isLoading || filtered.length === 0}
                onClick={() => exportCsv(filtered, cols, dataset)}
              >
                <Download size={13} aria-hidden="true" /> Export CSV
              </button>
            </div>
          </div>

          {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

          {isLoading ? (
            <LoadingState label={`Loading ${activeLabel.toLowerCase()}...`} padding={48} />
          ) : error ? null : (
            <div className="card" style={{ padding: 0 }}>
              <DataTable
                data={paginated}
                columns={cols}
                rowKey="id"
                sort={sort}
                onSortChange={setSort}
                emptyTitle={rawData.length === 0 ? 'No records yet.' : 'No records match your search.'}
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
