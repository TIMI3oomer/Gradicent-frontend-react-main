import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Star } from 'lucide-react';
import { useState } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Avatar } from '../../components/shared/Avatar';
import { Badge } from '../../components/shared/Badge';
import { mockEmployees } from '../../data/employees';
import { formatCurrency, formatDate } from '../../lib/formatters';

const TABS = ['Profile', 'Performance', 'Schedule'];

export function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Profile');

  const emp = mockEmployees.find(e => e.id === id);

  if (!emp) {
    return (
      <BusinessLayout title="Employee Not Found">
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 16 }}>Employee not found.</div>
          <button className="btn-primary btn-md" onClick={() => navigate('/business/employees')}>Back to Employees</button>
        </div>
      </BusinessLayout>
    );
  }

  const scoreColor = emp.performanceScore >= 90 ? '#22c55e' : emp.performanceScore >= 75 ? '#f59e0b' : 'var(--danger)';

  return (
    <BusinessLayout title={emp.name}>
      <button
        className="btn-ghost btn-sm"
        onClick={() => navigate('/business/employees')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}
      >
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
              <Badge status={emp.status as 'Active' | 'On Leave' | 'Terminated'} />
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
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 20 }}>{emp.bio}</p>
            <div className="card-title" style={{ marginBottom: 12 }}>Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {emp.skills.map(skill => (
                <span key={skill} style={{ padding: '4px 10px', background: 'var(--primary)', color: 'white', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>{skill}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'Performance' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Performance Overview</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <div style={{
              width: 96, height: 96, borderRadius: '50%',
              background: `conic-gradient(${scoreColor} ${emp.performanceScore}%, var(--border) 0)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 0 6px var(--bg)`,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: 'var(--card-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: scoreColor }}>{emp.performanceScore}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>/ 100</div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                {emp.performanceScore >= 90 ? 'Excellent' : emp.performanceScore >= 75 ? 'Good' : 'Needs Improvement'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Performance rating based on KPIs and peer review</div>
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.round(emp.performanceScore / 20) ? '#f59e0b' : 'transparent'} stroke="#f59e0b" />
                ))}
              </div>
            </div>
          </div>
          {[
            { label: 'Task Completion', value: emp.performanceScore },
            { label: 'Client Satisfaction', value: Math.min(100, emp.performanceScore + 4) },
            { label: 'Attendance', value: Math.min(100, emp.performanceScore + 2) },
            { label: 'Collaboration', value: Math.max(60, emp.performanceScore - 6) },
          ].map(item => (
            <div key={item.label} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>{item.label}</span>
                <span style={{ color: scoreColor, fontWeight: 700 }}>{item.value}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${item.value}%`, height: '100%', background: scoreColor, borderRadius: 3, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Schedule' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Weekly Schedule</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <div key={day} style={{ background: 'var(--surface)', borderRadius: 8, padding: 16, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginBottom: 8 }}>{day}</div>
                {i < 4 ? (
                  <>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>9:00 AM</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Work</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{emp.weeklyHours / 5}h</div>
                  </>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Day off</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
