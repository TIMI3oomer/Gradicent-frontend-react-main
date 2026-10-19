import { useMemo, useState } from 'react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { MedicalStatCard } from '../../components/medical/MedicalStatCard';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { medicalStats } from '../../data/stats';
import { formatNumber } from '../../lib/formatters';
import { Users, Activity, Star, Clock } from 'lucide-react';

// The visit series is monthly, so ranges are expressed in months
const DATE_RANGES = [
  { label: 'Last 3 months', months: 3 },
  { label: 'Last 6 months', months: 6 },
  { label: 'Last 12 months', months: 12 },
] as const;
type RangeLabel = typeof DATE_RANGES[number]['label'];

const colors = ['#CE7A35', '#78CEE6', '#4CAF7D', '#E8A838', '#D95C5C', '#9B8E87', '#C8AF99', '#6B6560'];

export function MedicalStats() {
  const [dateRange, setDateRange] = useState<RangeLabel>('Last 12 months');
  const months = DATE_RANGES.find(r => r.label === dateRange)?.months ?? 12;
  const visitData = useMemo(() => medicalStats.visitsByMonth.slice(-months), [months]);
  const visitsInRange = visitData.reduce((sum, m) => sum + m.visits, 0);

  return (
    <MedicalLayout title="Analytics">
      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <MedicalStatCard title="Total Patients" value={medicalStats.totalPatients} trend="up" trendValue="+15% vs last period" icon={<Users size={18} />} index={0} />
        <MedicalStatCard title="Total Visits" value={1243} trend="up" trendValue="+8% vs last period" icon={<Activity size={18} />} index={1} />
        <MedicalStatCard title="Patient Satisfaction" value={medicalStats.patientSatisfaction} unit="%" trend="up" trendValue="+2% vs last period" icon={<Star size={18} />} index={2} />
        <MedicalStatCard title="Avg Visit Duration" value={medicalStats.avgVisitDuration} unit=" min" trend="down" lowerIsBetter trendValue="3 min shorter than last period" icon={<Clock size={18} />} index={3} />
      </div>

      {/* Charts row 1 */}
      <div className="two-col-wide" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="card-title">Monthly Visits</div>
              <div className="card-subtitle">{formatNumber(visitsInRange)} visits in the {dateRange.toLowerCase()}</div>
            </div>
            <div role="group" aria-label="Visit chart range" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {DATE_RANGES.map(r => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => setDateRange(r.label)}
                  aria-pressed={dateRange === r.label}
                  className={dateRange === r.label ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={visitData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="medicalVisitsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#CE7A35" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#CE7A35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                axisLine={false}
                tickLine={false}
                width={40}
                tickFormatter={v => formatNumber(Number(v))}
              />
              <Tooltip
                formatter={(v: number) => [formatNumber(v), 'Visits']}
                contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="visits"
                name="Visits"
                stroke="#CE7A35"
                strokeWidth={2}
                fill="url(#medicalVisitsGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#CE7A35' }}
              />
            </AreaChart>
          </ResponsiveContainer>
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
