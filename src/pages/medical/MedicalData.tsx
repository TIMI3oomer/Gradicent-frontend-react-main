import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Database } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { sortRows, type SortState } from '../../components/shared/DataTable/sortRows';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage } from '../../components/shared/apiHelpers';
import { MEDICAL_DOMAIN, fetchPatients, isBookedSlot, toAppointmentSlots } from '../../components/medical/patientData';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate, toLocalIsoDate } from '../../lib/formatters';
import { MEDICAL_ROUTES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PAGE_SIZE = 25;
// The binder only exposes appointments per day, so the visits dataset covers a fixed recent window
const VISIT_DAYS = 7;

type DatasetKey = 'patients' | 'visits';
type Row = Record<string, string | number | null>;

const DATASETS: { key: DatasetKey; label: string }[] = [
  { key: 'patients', label: 'Patients' },
  { key: 'visits', label: `Appointments (last ${VISIT_DAYS} days)` },
];

const text = (v: unknown) => (v === undefined || v === null || v === '' ? '—' : String(v));

const patientCols: Column<Row>[] = [
  { key: 'id', header: 'Patient ID', width: '100px', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{text(v)}</span> },
  { key: 'name', header: 'Patient', sortable: true, render: v => <span style={{ fontWeight: 600 }}>{text(v)}</span> },
  { key: 'age', header: 'Age', sortable: true, align: 'right', render: text },
  { key: 'condition', header: 'Condition', sortable: true, render: text },
  { key: 'doctor', header: 'Doctor', sortable: true, render: text },
  { key: 'phone', header: 'Phone', render: text },
  { key: 'registered', header: 'Registered', sortable: true, render: v => formatDate(v as string | null) },
  { key: 'status', header: 'Status', render: v => <Badge status={v as 'Active'} size="sm" /> },
];

const visitCols: Column<Row>[] = [
  { key: 'date', header: 'Date', sortable: true, render: v => formatDate(v as string | null) },
  { key: 'slot', header: 'Slot', sortable: true, width: '80px', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{text(v)}</span> },
  { key: 'patient', header: 'Patient', sortable: true, render: v => <span style={{ fontWeight: 600 }}>{text(v)}</span> },
  { key: 'phone', header: 'Phone', render: text },
  { key: 'notes', header: 'Notes', render: text },
  { key: 'status', header: 'Status', render: v => <Badge status={v as 'Scheduled'} size="sm" /> },
];

const COLUMNS: Record<DatasetKey, Column<Row>[]> = { patients: patientCols, visits: visitCols };

function csvCell(value: unknown) {
  let s = value === null || value === undefined ? '' : String(value);
  // Neutralise spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadCsv(rows: Row[], columns: Column<Row>[], name: string) {
  const keys = columns.map(c => String(c.key));
  const lines = [
    columns.map(c => csvCell(c.header)).join(','),
    ...rows.map(row => keys.map(k => csvCell(row[k])).join(',')),
  ];
  // BOM so Excel opens UTF-8 names correctly
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `binder-software-medical-${name}-${toLocalIsoDate()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function recentDates(days: number) {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return toLocalIsoDate(d);
  });
}

async function loadPatientRows(userId: string | number): Promise<Row[]> {
  const patients = await fetchPatients(userId);
  return patients.map(p => ({
    id: p.id,
    name: p.name,
    age: p.age,
    condition: p.primaryCondition,
    doctor: p.doctor,
    phone: p.phone,
    registered: p.createdAt,
    status: p.status,
  }));
}

/** Loads the last few days of booked slots; throws only when every day fails. */
async function loadVisitRows(userId: string | number): Promise<{ rows: Row[]; failedDays: number; firstError: unknown }> {
  const dates = recentDates(VISIT_DAYS);
  const results = await Promise.allSettled(dates.map(date => api.getAppointmentsForDate(date, MEDICAL_DOMAIN, userId)));
  const rows: Row[] = [];
  let failedDays = 0;
  let firstError: unknown = null;
  results.forEach((result, i) => {
    if (result.status === 'rejected') {
      failedDays += 1;
      firstError ??= result.reason;
      return;
    }
    toAppointmentSlots(Array.isArray(result.value) ? result.value : [], dates[i])
      .filter(isBookedSlot)
      .forEach(slot => rows.push({
        id: `${slot.date}-${slot.no}`,
        date: slot.date,
        slot: slot.time || slot.no,
        patient: slot.name,
        phone: slot.phone,
        notes: slot.msg,
        status: slot.locked ? 'Locked' : 'Open',
      }));
  });
  if (failedDays === dates.length) throw firstError ?? new Error('Could not load appointments.');
  return { rows, failedDays, firstError };
}

export function MedicalData() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [dataset, setDataset] = useState<DatasetKey>('patients');
  const [rawData, setRawData] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);
  const debouncedSearch = useDebounce(search, 300);

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

    const loadDataset = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (dataset === 'patients') {
          const rows = await loadPatientRows(userId);
          if (ignore) return;
          setRawData(rows);
        } else {
          const { rows, failedDays, firstError } = await loadVisitRows(userId);
          if (ignore) return;
          setRawData(rows);
          if (failedDays > 0) {
            console.error('[Data Explorer] Some days failed:', firstError);
            setError(`Some days could not be loaded (${failedDays} of ${VISIT_DAYS}).`);
          }
        }
      } catch (err) {
        if (ignore) return;
        console.error(`[Data Explorer] Failed loading ${dataset}:`, err);
        setRawData([]);
        setError(errorMessage(err, 'Could not load records.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadDataset();
    return () => { ignore = true; };
  }, [dataset, user?.id, authLoading, reloadKey]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return rawData;
    return rawData.filter(row => Object.values(row).some(v => v !== null && String(v).toLowerCase().includes(q)));
  }, [rawData, debouncedSearch]);

  // Sort the full filtered list before slicing so sorting spans every page
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const columns = COLUMNS[dataset];

  const handleSortChange = (next: SortState) => {
    setSort(next);
    setPage(1);
  };

  const switchDataset = (next: DatasetKey) => {
    if (next === dataset) return;
    setDataset(next);
    setRawData([]);
    setSort(null);
    setPage(1);
  };

  return (
    <MedicalLayout title="Data Explorer">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="filter-row">
          <div role="group" aria-label="Dataset" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {DATASETS.map(d => (
              <button
                key={d.key}
                type="button"
                className={dataset === d.key ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
                aria-pressed={dataset === d.key}
                onClick={() => switchDataset(d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <div className="search-input-wrap">
            <Search size={14} className="search-icon" aria-hidden="true" />
            <input
              className="form-input search-input"
              type="search"
              placeholder={dataset === 'patients' ? 'Search by name, condition, doctor...' : 'Search by patient, phone, notes...'}
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              aria-label="Search records"
            />
          </div>
          <button
            type="button"
            className="btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}
            onClick={() => downloadCsv(sorted, columns, dataset)}
            disabled={isLoading || sorted.length === 0}
            title={`Download the ${sorted.length} matching records as CSV`}
          >
            <Download size={13} aria-hidden="true" /> Export CSV
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }} aria-live="polite">{isLoading ? 'Loading...' : `${filtered.length} records`}</span>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

      {isLoading ? (
        <LoadingState label="Loading records..." />
      ) : rawData.length === 0 ? (
        error ? null : (
          <EmptyState
            icon={<Database size={32} />}
            title="No records yet"
            description={dataset === 'patients' ? 'Patients you add will appear here.' : `No appointments were booked in the last ${VISIT_DAYS} days.`}
          />
        )
      ) : (
        <>
          <div className="card" style={{ marginBottom: 16 }}>
            <DataTable
              data={paged}
              columns={columns}
              rowKey="id"
              onRowClick={dataset === 'patients' ? row => navigate(`${MEDICAL_ROUTES.PATIENTS}/${encodeURIComponent(String(row.id))}`) : undefined}
              sort={sort}
              onSortChange={handleSortChange}
              emptyTitle="No records match your search."
            />
          </div>
          <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={PAGE_SIZE} onPageChange={setPage} />
        </>
      )}
    </MedicalLayout>
  );
}
