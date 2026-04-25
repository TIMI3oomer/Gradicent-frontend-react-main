import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, LayoutList } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { PatientCard } from '../../components/medical/PatientCard';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { Avatar } from '../../components/shared/Avatar';
import { mockPatients } from '../../data/patients';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../lib/formatters';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { MEDICAL_ROUTES } from '../../lib/constants';

const PAGE_SIZE = 12;

type PatientRow = (typeof mockPatients)[0];

export function Patients() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>('patients-view', 'grid');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    return mockPatients.filter(p => {
      const matchSearch = !debouncedSearch || [p.name, p.id, p.primaryCondition, p.doctor].some(v =>
        v.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [debouncedSearch, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<PatientRow>[] = [
    {
      key: 'name', header: 'Patient', sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={row.name} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{row.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'age', header: 'Age', sortable: true, width: '60px' },
    { key: 'primaryCondition', header: 'Condition', sortable: true },
    { key: 'doctor', header: 'Doctor', sortable: true },
    { key: 'lastVisit', header: 'Last Visit', sortable: true, render: v => formatDate(String(v), 'short') },
    { key: 'status', header: 'Status', render: v => <Badge status={v as PatientRow['status']} size="sm" withDot={v === 'Active'} /> },
    {
      key: 'id', header: '', width: '100px', align: 'right',
      render: (_, row) => (
        <button className="btn-ghost btn-sm" onClick={() => navigate(`/medical/patients/${row.id}`)}>
          View
        </button>
      ),
    },
  ];

  return (
    <MedicalLayout title="Patients" actionLabel="Add Patient" actionPath={MEDICAL_ROUTES.ADD_PATIENT}>
      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="filter-row">
          <div className="search-input-wrap">
            <Search size={14} className="search-icon" aria-hidden="true" />
            <input
              className="form-input search-input"
              type="search"
              placeholder="Search by name, ID, or condition..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              aria-label="Search patients"
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            aria-label="Filter by status"
          >
            {['All', 'Active', 'Discharged', 'Pending'].map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            <button
              className={`topbar-icon-btn${viewMode === 'grid' ? '' : ''}`}
              style={{ background: viewMode === 'grid' ? 'var(--accent-light)' : 'transparent', color: viewMode === 'grid' ? 'var(--accent)' : 'var(--text-muted)' }}
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className="topbar-icon-btn"
              style={{ background: viewMode === 'table' ? 'var(--accent-light)' : 'transparent', color: viewMode === 'table' ? 'var(--accent)' : 'var(--text-muted)' }}
              onClick={() => setViewMode('table')}
              aria-label="Table view"
              aria-pressed={viewMode === 'table'}
            >
              <LayoutList size={16} />
            </button>
          </div>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {filtered.length} of {mockPatients.length} patients
          </span>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="patient-grid" style={{ marginBottom: 16 }}>
          {paged.map((patient, i) => (
            <PatientCard key={patient.id} patient={patient} index={i} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ marginBottom: 16 }}>
          <DataTable
            data={paged}
            columns={columns}
            onRowClick={row => navigate(`/medical/patients/${row.id}`)}
            rowKey="id"
          />
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </MedicalLayout>
  );
}
