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
    const fetchStaffRegistry = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        setError(null);

        let res;
        const cleanQuery = search.trim();

        if (!cleanQuery) {
          // Standard GET listing parameter routing mapping
          res = await api.fetchList<any>('/api/binder/employee', {
            domain: 'business',
            user_id: user.id
          });
        } else {
          // Dedicated POST search execution
          res = await api.searchEntities<any>('/api/binder/employees/search', {
            domain: 'business',
            user_id: user.id,
            query: cleanQuery
          });
        }

        const results = res.data?.employees || res.data?.results || res.data || [];
        setEmployees(Array.isArray(results) ? results : []);
      } catch (err: any) {
        console.error('[Employees Registry] Fetch Error:', err);
        setError(err.message || 'Could not populate staff directory entries.');
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchStaffRegistry();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [user?.id, search]);

  const filtered = useMemo(() => {
    return employees.filter(emp => {
      if (dept !== 'All' && emp.department !== dept) return false;
      return true;
    });
  }, [employees, dept]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => { setPage(1); }, [dept, search]);

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Staff Member',
      sortable: true,
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => navigate(`/business/employees/${row.id}`)}>
          <Avatar src={row.avatar} name={String(v)} size="md" />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{String(v)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    { key: 'role', header: 'Role / Designation', sortable: true },
    { key: 'department', header: 'Department', sortable: true },
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> },
    { key: 'utilization', header: 'Utilization', align: 'right', sortable: true, render: v => <span style={{ fontWeight: 600 }}>{v}%</span> }
  ];

  return (
    <BusinessLayout title="Staff Directory">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Query staff members..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
            />
          </div>
          <select
            value={dept}
            onChange={e => setDept(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
          >
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            <button onClick={() => setView('table')} style={{ padding: 8, background: view === 'table' ? 'var(--surface)' : 'transparent', border: 0, color: view === 'table' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}><List size={16} /></button>
            <button onClick={() => setView('cards')} style={{ padding: 8, background: view === 'cards' ? 'var(--surface)' : 'transparent', border: 0, color: view === 'cards' ? 'var(--primary)' : 'var(--text-muted)', cursor: 'pointer' }}><LayoutGrid size={16} /></button>
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}><UserPlus size={16} /> Onboard Staff</button>
        </div>
      </div>

      {error && (
        <div style={{ padding: 16, background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: 6, color: '#ef4444', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: 'var(--text-muted)' }}>Synchronizing staff nodes...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<LayoutGrid size={36} />} title="No Employees Found" description="No personnel directory items align with standard filter metrics." />
      ) : (
        <>
          {view === 'table' ? (
            <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
              <DataTable data={paginated} columns={columns} rowKey="id" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
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