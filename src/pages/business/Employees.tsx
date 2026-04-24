import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutGrid, List, UserPlus } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Avatar } from '../../components/shared/Avatar';
import { Pagination } from '../../components/shared/Pagination';
import { EmptyState } from '../../components/shared/EmptyState';
import { mockEmployees } from '../../data/employees';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Employee } from '../../types';

const PAGE_SIZE = 10;
const DEPARTMENTS = ['All', 'Sales', 'Engineering', 'Marketing', 'Finance', 'Support', 'Customer Success'];

export function Employees() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('All');
  const [view, setView] = useState<'table' | 'cards'>('table');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockEmployees.filter(e => {
      const matchSearch = !q || e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
      const matchDept = dept === 'All' || e.department === dept;
      return matchSearch && matchDept;
    });
  }, [search, dept]);

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
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{formatCurrency(v as number)}</span>
      ),
    },
    {
      key: 'performanceScore', header: 'Perf.', align: 'right', sortable: true, render: v => {
        const score = v as number;
        const color = score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : 'var(--danger)';
        return <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color, fontSize: 13 }}>{score}</span>;
      },
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Active' | 'On Leave' | 'Terminated'} size="sm" /> },
    { key: 'hireDate', header: 'Hire Date', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(v as string, 'short')}</span> },
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

      <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--text-muted)' }}>
        {filtered.length} employee{filtered.length !== 1 ? 's' : ''} found
      </div>

      {view === 'table' ? (
        <>
          <div className="card" style={{ padding: 0 }}>
            <DataTable
              data={paginated}
              columns={columns}
              onRowClick={row => navigate(`/business/employees/${(row as Employee).id}`)}
              rowKey="id"
              emptyTitle="No employees match your filters."
            />
          </div>
          {filtered.length > PAGE_SIZE && (
            <div style={{ marginTop: 16 }}>
              <Pagination page={page} pageSize={PAGE_SIZE} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onPageChange={setPage} />
            </div>
          )}
        </>
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
                  style={{ cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', textAlign: 'center' }}
                  onClick={() => navigate(`/business/employees/${emp.id}`)}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
                >
                  <Avatar src={emp.avatar} name={emp.name} size="xl" />
                  <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{emp.role}</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{emp.department}</span>
                    <Badge status={emp.status as 'Active' | 'On Leave' | 'Terminated'} size="sm" />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                    <span>Score: <strong style={{ color: emp.performanceScore >= 90 ? '#22c55e' : '#f59e0b' }}>{emp.performanceScore}</strong></span>
                    <span>{formatCurrency(emp.salary)}/yr</span>
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
