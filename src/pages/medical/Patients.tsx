import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, LayoutList, Users } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { PatientCard } from '../../components/medical/PatientCard';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { sortRows, type SortState } from '../../components/shared/DataTable/sortRows';
import { Badge } from '../../components/shared/Badge';
import { Pagination } from '../../components/shared/Pagination';
import { Avatar } from '../../components/shared/Avatar';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage } from '../../components/shared/apiHelpers';
import { fetchPatients } from '../../components/medical/patientData';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../lib/formatters';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { MEDICAL_ROUTES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import type { Patient } from '../../types';

const PAGE_SIZE = 12;

export function Patients() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'table'>('patients-view', 'grid');
  const debouncedSearch = useDebounce(search.trim(), 300);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // GET the list when the search box is empty, POST the search route otherwise
  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    // Ignore responses from earlier keystrokes that resolve after a newer request
    let ignore = false;

    const loadPatients = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const rows = await fetchPatients(userId, debouncedSearch);
        if (ignore) return;
        setPatients(rows);
      } catch (err) {
        if (ignore) return;
        console.error('[Patients] Fetch error:', err);
        setPatients([]);
        setError(errorMessage(err, 'Could not load your patients.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadPatients();
    return () => { ignore = true; };
  }, [user?.id, authLoading, debouncedSearch, reloadKey]);

  const filtered = useMemo(
    () => patients.filter(p => statusFilter === 'All' || p.status === statusFilter),
    [patients, statusFilter],
  );

  // Sort the full filtered list before slicing so sorting spans every page
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort]);
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSortChange = (next: SortState) => {
    setSort(next);
    setPage(1);
  };

  const openPatient = (id: string) => navigate(`${MEDICAL_ROUTES.PATIENTS}/${encodeURIComponent(id)}`);
  const isFiltering = !!debouncedSearch || statusFilter !== 'All';

  const columns: Column<Patient>[] = [
    {
      key: 'name', header: 'Patient', sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={row.name} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{row.name || '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'age', header: 'Age', sortable: true, width: '60px', render: v => (v === null || v === undefined ? '—' : String(v)) },
    { key: 'primaryCondition', header: 'Condition', sortable: true, render: v => (v ? String(v) : '—') },
    { key: 'doctor', header: 'Doctor', sortable: true, render: v => (v ? String(v) : '—') },
    { key: 'lastVisit', header: 'Last Visit', sortable: true, render: v => formatDate(v as string | null) },
    { key: 'status', header: 'Status', render: v => <Badge status={v as Patient['status']} size="sm" withDot={v === 'Active'} /> },
    {
      key: 'id', header: '', width: '100px', align: 'right',
      render: (_, row) => (
        <button
          className="btn-ghost btn-sm"
          aria-label={`View ${row.name || 'patient'}`}
          onClick={e => { e.stopPropagation(); openPatient(row.id); }}
          onKeyDown={e => e.stopPropagation()}
        >
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
              className="topbar-icon-btn"
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
          <span style={{ fontSize: 13, color: 'var(--text-muted)', whiteSpace: 'nowrap' }} aria-live="polite">
            {isLoading ? 'Loading...' : statusFilter === 'All' ? `${patients.length} patients` : `${filtered.length} of ${patients.length} patients`}
          </span>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

      {/* Content */}
      {isLoading ? (
        <LoadingState label="Loading patients..." />
      ) : error ? null : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={32} />}
          title="No patients found"
          description={isFiltering ? 'No patients match your search or filters.' : 'Add your first patient to get started.'}
          action={isFiltering ? undefined : (
            <button type="button" className="btn-primary btn-md" onClick={() => navigate(MEDICAL_ROUTES.ADD_PATIENT)}>Add Patient</button>
          )}
        />
      ) : (
        <>
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
                onRowClick={row => openPatient(row.id)}
                rowKey="id"
                sort={sort}
                onSortChange={handleSortChange}
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
        </>
      )}
    </MedicalLayout>
  );
}
