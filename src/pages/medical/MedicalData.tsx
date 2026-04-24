import { useState, useMemo } from 'react';
import { Search, Download } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { mockPatients } from '../../data/patients';
import { mockAppointments } from '../../data/appointments';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../lib/formatters';

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

export function MedicalData() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return allData;
    return allData.filter(row =>
      [row.patient, row.doctor, row.type, row.notes].some(v =>
        v.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    );
  }, [debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

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
            />
          </div>
          <button className="btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5, marginLeft: 'auto' }}>
            <Download size={13} /> Export CSV
          </button>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} records</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <DataTable data={paged} columns={columns} rowKey="id" />
      </div>

      <Pagination page={page} totalPages={totalPages} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} />

      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
        Data includes all recorded patient visits and appointments. {mockPatients.length} unique patients tracked.
      </div>
    </MedicalLayout>
  );
}
