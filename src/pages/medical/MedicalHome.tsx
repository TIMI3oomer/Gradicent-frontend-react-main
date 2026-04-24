import { motion } from 'framer-motion';
import { Users, Calendar, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { MedicalStatCard } from '../../components/medical/MedicalStatCard';
import { DataTable } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { Avatar } from '../../components/shared/Avatar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { medicalStats } from '../../data/stats';
import { mockPatients } from '../../data/patients';
import { mockAppointments } from '../../data/appointments';
import { formatDate, formatRelativeTime } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import type { Column } from '../../components/shared/DataTable/DataTable';

const recentVisits = mockPatients.slice(0, 8).map(p => ({
  id: p.id,
  name: p.name,
  condition: p.primaryCondition,
  doctor: p.doctor,
  date: p.lastVisit,
  status: p.status,
  _patient: p,
}));

const todayAppts = mockAppointments
  .filter(a => a.type === 'Medical')
  .slice(0, 8);

const colors = ['#CE7A35', '#78CEE6', '#4CAF7D', '#E8A838', '#D95C5C', '#6B6560', '#9B8E87', '#C8AF99'];

export function MedicalHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const greeting = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  const columns: Column<typeof recentVisits[0]>[] = [
    {
      key: 'name', header: 'Patient', sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={row.name} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{row.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'condition', header: 'Condition', sortable: true },
    { key: 'doctor', header: 'Doctor', sortable: true },
    { key: 'date', header: 'Last Visit', sortable: true, render: (v) => formatDate(String(v), 'short') },
    { key: 'status', header: 'Status', render: (v) => <Badge status={v as 'Active' | 'Discharged' | 'Pending'} size="sm" withDot={v === 'Active'} /> },
  ];

  return (
    <MedicalLayout title={`Good ${greeting}, ${user?.name?.split(' ')[0] ?? 'Doctor'}`} actionLabel="Add Patient" actionPath="/medical/add-patient">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <MedicalStatCard title="Total Patients" value={medicalStats.totalPatients} trend="up" trendValue={`+${medicalStats.newPatientsThisMonth} this month`} icon={<Users size={18} />} index={0} />
        <MedicalStatCard title="Visits Today" value={medicalStats.visitsToday} trend="neutral" trendValue={`of ${medicalStats.visitsScheduledToday} scheduled`} icon={<Activity size={18} />} index={1} />
        <MedicalStatCard title="Appointments" value={medicalStats.appointmentsToday} trend="up" trendValue="Next in 34 min" icon={<Calendar size={18} />} index={2} />
        <MedicalStatCard title="Avg Wait Time" value={medicalStats.avgWaitTime} unit=" min" trend="down" trendValue="↓3 min vs last week" icon={<Clock size={18} />} index={3} />
      </div>

      {/* Row 2 */}
      <div className="two-col-wide" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Visits</div>
              <div className="card-subtitle">Latest patient interactions</div>
            </div>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/medical/data')}>View all</button>
          </div>
          <DataTable
            data={recentVisits}
            columns={columns}
            onRowClick={row => navigate(`/medical/patients/${row.id}`)}
            rowKey="id"
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Schedule</div>
            <button className="btn-ghost btn-sm" onClick={() => navigate('/medical/appointments')}>Full calendar</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {todayAppts.slice(0, 8).map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border-light)',
                  background: appt.status === 'Completed' ? 'var(--surface-alt)' : 'var(--surface)',
                  borderLeft: `3px solid ${appt.colorCode}`,
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/medical/appointments')}
              >
                <div style={{ width: 50, fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{appt.time}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{appt.attendeeName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{appt.appointmentType} · {appt.duration}min</div>
                </div>
                <Badge status={appt.status} size="sm" />
              </motion.div>
            ))}
            <button
              className="btn-ghost btn-sm"
              style={{ width: '100%', marginTop: 4 }}
              onClick={() => navigate('/medical/appointments')}
            >
              + Add appointment
            </button>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      <div className="two-col" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Top Conditions</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={medicalStats.topConditions.slice(0, 6)} layout="vertical" margin={{ left: 100, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="condition" tick={{ fontSize: 11, fill: 'var(--text)' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                formatter={(v: number) => [v, 'Patients']}
                contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {medicalStats.topConditions.slice(0, 6).map((_, index) => (
                  <Cell key={index} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 8 }}>Patient Satisfaction</div>
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Satisfied', value: medicalStats.patientSatisfaction },
                    { name: 'Rest', value: 100 - medicalStats.patientSatisfaction },
                  ]}
                  cx="50%" cy="100%"
                  startAngle={180} endAngle={0}
                  innerRadius={60} outerRadius={80}
                  dataKey="value"
                  paddingAngle={2}
                >
                  <Cell fill="#4CAF7D" />
                  <Cell fill="var(--border)" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: -60, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: '#4CAF7D', fontFamily: 'var(--font-lora)', lineHeight: 1 }}>
                {medicalStats.patientSatisfaction}%
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Patient Satisfaction</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { stars: 5, pct: 68 },
              { stars: 4, pct: 21 },
              { stars: 3, pct: 7 },
              { stars: 2, pct: 3 },
              { stars: 1, pct: 1 },
            ].map(r => (
              <div key={r.stars} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 48 }}>{'⭐'.repeat(r.stars)}</span>
                <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${r.pct}%`, height: '100%', background: r.stars >= 4 ? '#4CAF7D' : r.stars === 3 ? '#E8A838' : '#D95C5C', borderRadius: 3, transition: 'width 1s ease' }} />
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 28, textAlign: 'right' }}>{r.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent visits table note */}
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Showing {recentVisits.length} of {medicalStats.totalPatients} patients. Last updated {formatRelativeTime(new Date().toISOString())}.
      </div>
    </MedicalLayout>
  );
}
