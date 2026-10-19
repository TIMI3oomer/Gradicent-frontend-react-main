import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star, ChartBar as BarChart3, CalendarDays } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Avatar } from '../../components/shared/Avatar';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, toRecord } from '../../components/shared/apiHelpers';
import { BUSINESS_ROUTES } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const TABS = ['Profile', 'Performance', 'Schedule'] as const;
type Tab = typeof TABS[number];

function finiteOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [tab, setTab] = useState<Tab>('Profile');
  const [emp, setEmp] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    let ignore = false;

    const fetchEmployeeRecord = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const query = api.getContextQuery('business', userId);
        const res = await api.fetchOne<unknown>('/api/binder/employees', id, query);
        if (ignore) return;
        setEmp(toRecord<Employee>(res));
      } catch (err) {
        if (ignore) return;
        console.error('[EmployeeDetail] Fetch error:', err);
        setEmp(null);
        setError(errorMessage(err, 'Could not load this employee.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };
    fetchEmployeeRecord();
    return () => { ignore = true; };
  }, [id, user?.id, authLoading, reloadKey]);

  if (isLoading) {
    return (
      <BusinessLayout title="Employee">
        <LoadingState label="Loading employee..." padding="100px 0" />
      </BusinessLayout>
    );
  }

  if (error || !emp) {
    return (
      <BusinessLayout title="Employee Not Found">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 0', textAlign: 'center' }}>
          {error ? <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} /> : (
            <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 16 }}>Employee not found.</div>
          )}
          <button className="btn-primary btn-md" onClick={() => navigate(BUSINESS_ROUTES.EMPLOYEES)}>Back to Employees</button>
        </div>
      </BusinessLayout>
    );
  }

  const score = finiteOrNull(emp.performanceScore);
  const hours = finiteOrNull(emp.weeklyHours);
  const scoreColor = score === null ? 'var(--text)' : score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : 'var(--danger)';

  return (
    <BusinessLayout title={emp.name || 'Employee'}>
      <button className="btn-ghost btn-sm" onClick={() => navigate(BUSINESS_ROUTES.EMPLOYEES)} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <ArrowLeft size={14} aria-hidden="true" /> Back to Employees
      </button>

      {/* Hero */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
            <Avatar src={emp.avatar} name={emp.name} size="xl" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4, overflowWrap: 'anywhere' }}>{emp.name || '—'}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>{[emp.role, emp.department].filter(Boolean).join(' · ') || '—'}</div>
              <Badge status={emp.status as BadgeVariant} />
            </div>
          </div>
          <div className="biz-hero-stats">
            {[
              { label: 'Performance', value: score === null ? '—' : `${score}`, color: scoreColor },
              { label: 'Salary', value: formatCurrency(emp.salary), color: 'var(--primary)' },
              { label: 'Hrs/Week', value: hours === null ? '—' : `${hours}h`, color: 'var(--text)' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 8px', border: '1px solid var(--border)', minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)', overflowWrap: 'anywhere' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="biz-tabs" role="tablist" aria-label="Employee sections">
        {TABS.map(t => (
          <button
            key={t}
            role="tab"
            id={`employee-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`employee-panel-${t}`}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'var(--font-dm-sans)',
            }}
          >{t}</button>
        ))}
      </div>

      <div role="tabpanel" id={`employee-panel-${tab}`} aria-labelledby={`employee-tab-${tab}`}>
        {tab === 'Profile' && (
          <div className="two-col">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Contact Info</div>
              {[
                { icon: <Mail size={14} />, label: 'Email', value: emp.email || '—' },
                { icon: <Phone size={14} />, label: 'Phone', value: emp.phone || '—' },
                { icon: <MapPin size={14} />, label: 'Location', value: emp.location || '—' },
                { icon: <Calendar size={14} />, label: 'Hire Date', value: formatDate(emp.hireDate, 'long') },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} aria-hidden="true">{icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflowWrap: 'anywhere' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>About</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>{emp.bio || 'No bio provided.'}</p>
              <div className="card-title" style={{ marginBottom: 12 }}>Skills</div>
              {Array.isArray(emp.skills) && emp.skills.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {emp.skills.map(skill => (
                    <span key={skill} style={{ padding: '4px 10px', background: 'var(--primary)', color: 'white', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{skill}</span>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No skills listed.</p>
              )}
            </div>
          </div>
        )}

        {tab === 'Performance' && (
          score === null ? (
            <div className="card">
              <EmptyState
                icon={<BarChart3 size={32} />}
                title="No performance data yet"
                description="A performance score will appear here once one has been recorded for this employee."
              />
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: scoreColor, fontFamily: 'var(--font-mono)' }}>{score}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>/ 100</div>
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                  {score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : 'Needs Improvement'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Overall performance score</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 8 }} role="img" aria-label={`${Math.round(score / 20)} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} fill={i < Math.round(score / 20) ? '#f59e0b' : 'transparent'} stroke="#f59e0b" aria-hidden="true" />
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {tab === 'Schedule' && (
          <div className="card">
            <EmptyState
              icon={<CalendarDays size={32} />}
              title="No schedule set up"
              description={hours === null
                ? 'Working hours for this employee have not been recorded yet.'
                : `This employee is contracted for ${hours} hours per week. A detailed weekly schedule isn't available yet.`}
            />
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
