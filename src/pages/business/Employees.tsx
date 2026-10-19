import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, UserPlus, UserCheck } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { sortRows, type SortState } from '../../components/shared/DataTable/sortRows';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { Avatar } from '../../components/shared/Avatar';
import { Pagination } from '../../components/shared/Pagination';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorBanner, LoadingState } from '../../components/business/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, toArray } from '../../components/business/apiHelpers';
import { BUSINESS_ROUTES } from '../../lib/constants';
import type { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PAGE_SIZE = 10;

export function Employees() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortState>(null);

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

    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cleanQuery = search.trim();
        const res = cleanQuery
          ? await api.searchEntities<unknown>('/api/binder/employee/search', {
              domain: 'business',
              user_id: userId,
              query: cleanQuery,
            })
          : await api.fetchList<unknown>('/api/binder/employee', {
              domain: 'business',
              user_id: userId,
            });

        if (ignore) return;
        setEmployees(toArray<Employee>(res, 'employees'));
      } catch (err) {
        if (ignore) return;
        console.error('[Employees] Fetch error:', err);
        setEmployees([]);
        setError(errorMessage(err, 'Could not load your employees.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchEmployees, 300);

    return () => {
      ignore = true;
      clearTimeout(delayDebounce);
    };
  }, [user?.id, authLoading, search, reloadKey]);

  // Departments come from the data itself so the filter never offers empty options
  const departments = useMemo(() => {
    const set = new Set(employees.map(e => e.department).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [employees]);

  const filtered = useMemo(() => {
    const rows = employees.filter(emp => dept === 'All' || emp.department === dept);
    return sortRows(rows, sort);
  }, [employees, dept, sort]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => { setPage(1); }, [dept, search, sort]);

  const openEmployee = (id: string) => navigate(`${BUSINESS_ROUTES.EMPLOYEES}/${encodeURIComponent(id)}`);

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      sortable: true,
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Avatar src={row.avatar} name={v ? String(v) : ''} size="md" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{v ? String(v) : '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role', sortable: true, render: v => (v ? String(v) : '—') },
    { key: 'department', header: 'Department', sortable: true, render: v => (v ? String(v) : '—') },
    { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
    { key: 'weeklyHours', header: 'Hrs/Week', align: 'right', sortable: true, render: v => <span style={{ fontWeight: 600 }}>{v === undefined || v === null || v === '' ? '—' : `${v}h`}</span> },
  ];

  const toggleBtnStyle = (active: boolean) => ({
    padding: 8, background: active ? 'var(--surface)' : 'transparent', border: 0,
    color: active ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer',
  });

  return (
    <BusinessLayout title="Employees">
      <div className="biz-toolbar">
        <div className="biz-toolbar-filters">
          <div className="biz-search">
            <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="search"
              placeholder="Search employees..."
              aria-label="Search employees"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
            />
          </div>
          <select
            value={dept}
            aria-label="Filter by department"
            onChange={e => setDept(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
          >
            {departments.map(d => <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }} role="group" aria-label="View">
            <button type="button" aria-label="Table view" aria-pressed={view === 'table'} onClick={() => setView('table')} style={toggleBtnStyle(view === 'table')}><List size={16} aria-hidden="true" /></button>
            <button type="button" aria-label="Card view" aria-pressed={view === 'cards'} onClick={() => setView('cards')} style={toggleBtnStyle(view === 'cards')}><LayoutGrid size={16} aria-hidden="true" /></button>
          </div>
          {/* No add-employee form exists yet, so keep the action visible but inactive */}
          <button
            type="button"
            disabled
            title="Coming soon"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 500, cursor: 'not-allowed', opacity: 0.55 }}
          >
            <UserPlus size={16} aria-hidden="true" /> Add Employee
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

      {isLoading ? (
        <LoadingState label="Loading employees..." />
      ) : error ? null : filtered.length === 0 ? (
        <EmptyState
          icon={<UserCheck size={36} />}
          title="No Employees Found"
          description={search || dept !== 'All' ? 'No employees match your search or filters.' : 'Employees you add will appear here.'}
        />
      ) : (
        <>
          {view === 'table' ? (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <DataTable data={paginated} columns={columns} rowKey="id" onRowClick={row => openEmployee(row.id)} sort={sort} onSortChange={setSort} />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 220px), 1fr))', gap: 16 }}>
              {paginated.map(emp => (
                <div
                  key={emp.id}
                  className="card biz-clickable"
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${emp.name || 'employee'}`}
                  style={{ transition: 'transform 0.15s', textAlign: 'center' }}
                  onClick={() => openEmployee(emp.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEmployee(emp.id); }
                  }}
                >
                  <Avatar src={emp.avatar} name={emp.name} size="xl" />
                  <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{emp.name || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{emp.role}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                    {emp.department && <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{emp.department}</span>}
                    <Badge status={emp.status as BadgeVariant} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {filtered.length > PAGE_SIZE && (
            <div style={{ marginTop: 16 }}>
              <Pagination page={page} pageSize={PAGE_SIZE} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </BusinessLayout>
  );
}
