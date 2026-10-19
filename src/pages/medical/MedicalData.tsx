import { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { sortRows, type SortState } from '../../components/shared/DataTable/sortRows';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { mockPatients } from '../../data/patients';
import { mockAppointments } from '../../data/appointments';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate, toLocalIsoDate } from '../../lib/formatters';

const allData = mockAppointments.map(a => ({
  id: a.id,
  patient: a.attendeeName,
  doctor: a.hostName,
  date: a.date,
  type: a.appointmentType,
  duration: a.duration,
  status: a.status,
  notes: a.notes,
  location: a.location,
}));
type DataRow = typeof allData[0];

const CSV_COLUMNS: { key: keyof DataRow; header: string }[] = [
  { key: 'id', header: 'Visit ID' },
  { key: 'patient', header: 'Patient' },
  { key: 'doctor', header: 'Doctor' },
  { key: 'date', header: 'Date' },
  { key: 'type', header: 'Type' },
  { key: 'duration', header: 'Duration (min)' },
  { key: 'status', header: 'Status' },
  { key: 'location', header: 'Location' },
  { key: 'notes', header: 'Notes' },
];

function csvCell(value: unknown) {
  let text = value === null || value === undefined ? '' : String(value);
  // Neutralise spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(rows: DataRow[]) {
  const lines = [
    CSV_COLUMNS.map(c => csvCell(c.header)).join(','),
    ...rows.map(row => CSV_COLUMNS.map(c => csvCell(row[c.key])).join(',')),
  ];
  // BOM so Excel opens UTF-8 names correctly
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `binder-software-medical-visits-${toLocalIsoDate()}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function MedicalData() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [sort, setSort] = useState<SortState>(null);
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return allData;
    return allData.filter(row =>
      [row.patient, row.doctor, row.type, row.notes].some(v =>
        v.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    );
  }, [debouncedSearch]);

  // Sort the full filtered list before slicing so sorting spans every page
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSortChange = (next: SortState) => {
    setSort(next);
    setPage(1);
  };

  const columns: Column<DataRow>[] = [
    { key: 'id', header: 'Visit ID', width: '100px', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{String(v)}</span> },
    { key: 'patient', header: 'Patient', sortable: true },
    { key: 'doctor', header: 'Doctor', sortable: true },
    { key: 'date', header: 'Date', sortable: true, render: v => formatDate(String(v), 'short') },
    { key: 'type', header: 'Type', sortable: true },
    { key: 'duration', header: 'Duration', align: 'right', render: v => `${v} min` },
    { key: 'status', header: 'Status', render: v => <Badge status={v as DataRow['status']} size="sm" /> },
  ];

  return (
    <MedicalLayout title="Data Explorer">
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="filter-row">
          <div className="search-input-wrap">
            <Search size={14} className="search-icon" aria-hidden="true" />
            <input
              className="form-input search-input"
              type="search"
              placeholder="Search by patient, doctor, type..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              aria-label="Search visit records"
            />
          </div>
          <button
            type="button"
            className="btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}
            onClick={() => downloadCsv(sorted)}
            disabled={sorted.length === 0}
            title={`Download the ${sorted.length} matching records as CSV`}
          >
            <Download size={13} aria-hidden="true" /> Export CSV
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }} aria-live="polite">{filtered.length} records</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <DataTable data={paged} columns={columns} rowKey="id" sort={sort} onSortChange={handleSortChange} />
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
        Data includes all recorded patient visits and appointments. {mockPatients.length} unique patients tracked.
      </div>
    </MedicalLayout>
  );
}
