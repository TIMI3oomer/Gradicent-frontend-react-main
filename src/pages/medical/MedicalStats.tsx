import { useState } from 'react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { MedicalStatCard } from '../../components/medical/MedicalStatCard';
import { RevenueChart } from '../../components/business/RevenueChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { medicalStats } from '../../data/stats';
import { Users, Activity, Star, Clock } from 'lucide-react';

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'This year'];
const colors = ['#CE7A35', '#78CEE6', '#4CAF7D', '#E8A838', '#D95C5C', '#9B8E87', '#C8AF99', '#6B6560'];

export function MedicalStats() {
  const [dateRange, setDateRange] = useState('This year');
  const visitData = medicalStats.visitsByMonth.map(m => ({ month: m.month, revenue: m.visits, prevYear: Math.round(m.visits * 0.82) }));

  return (
    <MedicalLayout title="Analytics">
      {/* Date range */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {DATE_RANGES.map(r => (
          <button
            key={r}
            onClick={() => setDateRange(r)}
            className={dateRange === r ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
          >
            {r}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <MedicalStatCard title="Total Patients" value={medicalStats.totalPatients} trend="up" trendValue="+15% vs last period" icon={<Users size={18} />} index={0} />
        <MedicalStatCard title="Total Visits" value={1243} trend="up" trendValue="+8% vs last period" icon={<Activity size={18} />} index={1} />
        <MedicalStatCard title="Patient Satisfaction" value={medicalStats.patientSatisfaction} unit="%" trend="up" trendValue="+2% vs last period" icon={<Star size={18} />} index={2} />
        <MedicalStatCard title="Avg Visit Duration" value={medicalStats.avgVisitDuration} unit=" min" trend="down" trendValue="-3 min improvement" icon={<Clock size={18} />} index={3} />
      </div>

      {/* Charts row 1 */}
      <div className="two-col-wide" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Monthly Visits</div>
          <RevenueChart data={visitData} showPrevYear={true} height={240} />
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Visit Types</div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={medicalStats.visitsByType}
                dataKey="count"
                nameKey="type"
                cx="50%" cy="50%"
                outerRadius={80}
                innerRadius={50}
              >
                {medicalStats.visitsByType.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="two-col" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Top Conditions</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={medicalStats.topConditions} layout="vertical" margin={{ left: 110, right: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="condition" tick={{ fontSize: 11, fill: 'var(--text)' }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {medicalStats.topConditions.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Doctor Performance</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>
                {['Doctor', 'Patients', 'Visits', 'Satisfaction'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {medicalStats.doctorPerformance.map((d, i) => (
                <tr key={d.name} style={{ borderBottom: i < medicalStats.doctorPerformance.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text)' }}>{d.name}</td>
                  <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{d.patients}</td>
                  <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{d.visits}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${d.satisfaction}%`, height: '100%', background: '#4CAF7D', borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', minWidth: 32 }}>{d.satisfaction}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MedicalLayout>
  );
}
