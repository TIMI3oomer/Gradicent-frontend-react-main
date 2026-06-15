import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Avatar } from '../../components/shared/Avatar';
import { Badge } from '../../components/shared/Badge';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const TABS = ['Profile', 'Performance', 'Schedule'];

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tab, setTab] = useState('Profile');
  const [emp, setEmp] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployeeRecord = async () => {
      if (!user?.id || !id) return;
      try {
        setIsLoading(true);
        const query = api.getContextQuery('business', user.id);
        const res = await api.fetchOne<any>('/api/binder/employees', id, query);
        setEmp(res.data || res);
      } catch (err: any) {
        console.error('[Employee Profile] Fetch error:', err);
        setError('Employee record not found or inaccessible.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployeeRecord();
  }, [id, user?.id]);

  if (isLoading) {
    return (
      <BusinessLayout title="Loading HR File...">
        <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Retrieving personnel profile...</div>
      </BusinessLayout>
    );
  }

  if (error || !emp) {
    return (
      <BusinessLayout title="Employee Not Found">
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 16 }}>{error || 'Employee not found.'}</div>
          <button className="btn-primary btn-md" onClick={() => navigate('/business/employees')}>Back to Employees</button>
        </div>
      </BusinessLayout>
    );
  }

  const scoreColor = emp.performanceScore >= 90 ? '#22c55e' : emp.performanceScore >= 75 ? '#f59e0b' : 'var(--danger)';

  return (
    <BusinessLayout title={emp.name}>
      <button className="btn-ghost btn-sm" onClick={() => navigate('/business/employees')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <ArrowLeft size={14} /> Back to Employees
      </button>

      {/* Hero */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Avatar src={emp.avatar} name={emp.name} size="xl" />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{emp.name}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>{emp.role} · {emp.department}</div>
              <Badge status={emp.status as any} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 110px)', gap: 16, textAlign: 'center' }}>
            {[
              { label: 'Performance', value: `${emp.performanceScore}`, color: scoreColor },
              { label: 'Salary', value: formatCurrency(emp.salary), color: 'var(--primary)' },
              { label: 'Hrs/Week', value: `${emp.weeklyHours}h`, color: 'var(--text)' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t}
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

      {tab === 'Profile' && (
        <div className="two-col">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Contact Info</div>
            {[
              { icon: <Mail size={14} />, label: 'Email', value: emp.email },
              { icon: <Phone size={14} />, label: 'Phone', value: emp.phone },
              { icon: <MapPin size={14} />, label: 'Location', value: emp.location },
              { icon: <Calendar size={14} />, label: 'Hire Date', value: formatDate(emp.hireDate, 'long') },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>About</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>{emp.bio || 'No bio provided.'}</p>
            <div className="card-title" style={{ marginBottom: 12 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {(emp.skills || []).map(skill => (
                <span key={skill} style={{ padding: '4px 10px', background: 'var(--primary)', color: 'white', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {tab === 'Performance' && (
         <div className="card"><div style={{color: 'var(--text-muted)'}}>Performance visualizer...</div></div>
      )}
      
      {tab === 'Schedule' && (
         <div className="card"><div style={{color: 'var(--text-muted)'}}>Schedule visualizer...</div></div>
      )}

    </BusinessLayout>
  );
}