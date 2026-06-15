import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, UserPlus } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Avatar } from '../../components/shared/Avatar';
import { Pagination } from '../../components/shared/Pagination';
import { EmptyState } from '../../components/shared/EmptyState';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const PAGE_SIZE = 10;
const DEPARTMENTS = ['All', 'Sales', 'Engineering', 'Marketing', 'Finance', 'Support', 'Customer Success'];

export function Employees() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const res = await api.searchEntities<any>('/api/binder/employee/search', {
          domain: 'business',
          user_id: user.id,
          query: ''
        });
        const results = res.data?.results || res.data || [];
        setEmployees(Array.isArray(results) ? results : []);
        setError(null);
      } catch (err: any) {
        console.error('[Employees] Fetch error:', err);
        setError('Failed to load employee directory.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployees();
  }, [user?.id]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(e => {
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchDept = dept === 'All' || e.department === dept;
      return matchSearch && matchDept;
    });
  }, [employees, search, dept]);

  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: Column<Employee>[] = [
    {
      key: 'name', header: 'Employee', sortable: true, render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar src={row.avatar} name={String(v)} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{String(v)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.role}</div>
          </div>
        </div>
      ),
    },
    { key: 'department', header: 'Department', render: v => <span style={{ fontSize: 12 }}>{String(v)}</span> },
    { key: 'location', header: 'Location', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{String(v)}</span> },
    {
      key: 'salary', header: 'Salary', align: 'right', sortable: true, render: v => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(Number(v))}</span>
      ),
    },
    {
      key: 'performanceScore', header: 'Perf.', align: 'right', sortable: true, render: v => {
        const score = Number(v);
        const color = score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : 'var(--danger)';
        return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color, fontSize: 13 }}>{score}</span>;
      },
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> },
    {
      key: 'id', header: '', align: 'right', render: (_, row) => (
        <button className="btn-ghost btn-sm" onClick={e => { e.stopPropagation(); navigate(`/business/employees/${row.id}`); }}>View</button>
      ),
    },
  ];

  return (
    <BusinessLayout title="Employees">
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, height: 36 }}
            placeholder="Search employees..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {DEPARTMENTS.map(d => (
            <button key={d} className={dept === d ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => { setDept(d); setPage(1); }}>{d}</button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
            <button className={view === 'table' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setView('table')} style={{ padding: '4px 8px' }}><List size={14} /></button>
            <button className={view === 'cards' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setView('cards')} style={{ padding: '4px 8px' }}><LayoutGrid size={14} /></button>
          </div>
          <button className="btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UserPlus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Retrieving personnel records...</div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--danger)' }}>{error}</div>
      ) : (
        <>
          <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
            {filtered.length} employee{filtered.length !== 1 ? 's' : ''} found
          </div>

          {view === 'table' ? (
            <div className="card" style={{ padding: 0 }}>
              <DataTable data={paginated} columns={columns} onRowClick={row => navigate(`/business/employees/${(row as Employee).id}`)} rowKey="id" emptyTitle="No employees match your filters." />
            </div>
          ) : (
            <>
              {paginated.length === 0 ? (
                <EmptyState icon={<UserPlus size={32} />} title="No employees found" description="Try adjusting your filters." />
              ) : (
                <div className="three-col">
                  {paginated.map(emp => (
                    <div
                      key={emp.id}
                      className="card"
                      style={{ cursor: 'pointer', transition: 'transform 0.15s', textAlign: 'center' }}
                      onClick={() => navigate(`/business/employees/${emp.id}`)}
                    >
                      <Avatar src={emp.avatar} name={emp.name} size="xl" />
                      <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{emp.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{emp.role}</div>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{emp.department}</span>
                        <Badge status={emp.status as any} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
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