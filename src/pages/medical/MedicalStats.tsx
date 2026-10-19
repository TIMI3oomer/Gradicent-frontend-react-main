import { useEffect, useMemo, useState } from 'react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { MedicalStatCard } from '../../components/medical/MedicalStatCard';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage } from '../../components/shared/apiHelpers';
import { countBy, fetchPatients, isNewThisMonth } from '../../components/medical/patientData';
import { formatNumber, parseDate } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import type { Patient } from '../../types';
import { Users, UserPlus, Activity, Cake } from 'lucide-react';

// Registrations are bucketed by month, so ranges are expressed in months
const DATE_RANGES = [
  { label: 'Last 3 months', months: 3 },
  { label: 'Last 6 months', months: 6 },
  { label: 'Last 12 months', months: 12 },
] as const;
type RangeLabel = typeof DATE_RANGES[number]['label'];

const colors = ['#CE7A35', '#78CEE6', '#4CAF7D', '#E8A838', '#D95C5C', '#9B8E87', '#C8AF99', '#6B6560'];
const GENDER_LABELS: Record<string, string> = { F: 'Female', M: 'Male', Other: 'Other' };

const emptyNote = (message: string) => (
  <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>{message}</div>
);

/** Patients registered per calendar month, oldest first, for the last `months` months. */
function registrationsByMonth(patients: Patient[], months: number) {
  const now = new Date();
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return { year: d.getFullYear(), monthIndex: d.getMonth(), month: d.toLocaleDateString('en-US', { month: 'short' }), patients: 0 };
  });
  for (const p of patients) {
    const created = parseDate(p.createdAt);
    if (!created) continue;
    const bucket = buckets.find(b => b.year === created.getFullYear() && b.monthIndex === created.getMonth());
    if (bucket) bucket.patients += 1;
  }
  return buckets.map(({ month, patients: count }) => ({ month, patients: count }));
}

export function MedicalStats() {
  const { user, isLoading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState<RangeLabel>('Last 12 months');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    let ignore = false;

    const loadStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Analytics are derived from the patient records the binder returns
        const rows = await fetchPatients(userId);
        if (ignore) return;
        setPatients(rows);
      } catch (err) {
        if (ignore) return;
        console.error('[MedicalStats] Error:', err);
        setPatients([]);
        setError(`Analytics could not be loaded: ${errorMessage(err, 'unknown error')}`);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadStats();
    return () => { ignore = true; };
  }, [user?.id, authLoading, reloadKey]);

  const months = DATE_RANGES.find(r => r.label === dateRange)?.months ?? 12;
  const registrationData = useMemo(() => registrationsByMonth(patients, months), [patients, months]);
  const registeredInRange = registrationData.reduce((sum, m) => sum + m.patients, 0);
  const hasRegistrationDates = patients.some(p => parseDate(p.createdAt));

  const topConditions = useMemo(
    () => countBy(patients, p => p.primaryCondition).slice(0, 8).map(c => ({ condition: c.label, count: c.count })),
    [patients],
  );
  const genders = useMemo(
    () => countBy(patients, p => GENDER_LABELS[p.gender] ?? '').map(g => ({ gender: g.label, count: g.count })),
    [patients],
  );
  const doctors = useMemo(() => countBy(patients, p => p.doctor).map(d => ({
    name: d.label,
    patients: d.count,
    active: patients.filter(p => p.doctor.trim() === d.label && p.status === 'Active').length,
  })), [patients]);

  const ages = patients.map(p => p.age).filter((a): a is number => a !== null);
  const avgAge = ages.length ? Math.round(ages.reduce((s, a) => s + a, 0) / ages.length) : 0;
  const newThisMonth = patients.filter(p => isNewThisMonth(p)).length;
  const activeCount = patients.filter(p => p.status === 'Active').length;

  if (isLoading) {
    return (
      <MedicalLayout title="Analytics">
        <LoadingState label="Loading analytics..." padding="100px 0" />
      </MedicalLayout>
    );
  }

  if (error) {
    return (
      <MedicalLayout title="Analytics">
        <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />
      </MedicalLayout>
    );
  }

  return (
    <MedicalLayout title="Analytics">
      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        <MedicalStatCard title="Total Patients" value={patients.length} icon={<Users size={18} />} index={0} />
        <MedicalStatCard
          title="New This Month" value={newThisMonth}
          trend={newThisMonth > 0 ? 'up' : 'neutral'} trendValue={`${registeredInRange} in the ${dateRange.toLowerCase()}`}
          icon={<UserPlus size={18} />} index={1}
        />
        <MedicalStatCard
          title="Active Patients" value={activeCount}
          trend="neutral" trendValue={patients.length ? `${Math.round((activeCount / patients.length) * 100)}% of all patients` : 'No patients yet'}
          icon={<Activity size={18} />} index={2}
        />
        <MedicalStatCard
          title="Average Age" value={avgAge} unit={ages.length ? ' yrs' : undefined}
          trend="neutral" trendValue={ages.length ? `from ${ages.length} patients with a date of birth` : 'No ages on file'}
          icon={<Cake size={18} />} index={3}
        />
      </div>

      {/* Charts row 1 */}
      <div className="two-col-wide" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div className="card-title">New Patients</div>
              <div className="card-subtitle">{formatNumber(registeredInRange)} registered in the {dateRange.toLowerCase()}</div>
            </div>
            <div role="group" aria-label="New patients chart range" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
          {!hasRegistrationDates ? emptyNote('No registration dates on file yet.') : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={registrationData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="medicalPatientsGrad" x1="0" y1="0" x2="0" y2="1">
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
                  formatter={(v: number) => [formatNumber(v), 'New patients']}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  name="New patients"
                  stroke="#CE7A35"
                  strokeWidth={2}
                  fill="url(#medicalPatientsGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#CE7A35' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Gender</div>
          {genders.length === 0 ? emptyNote('No gender data on file yet.') : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={genders}
                  dataKey="count"
                  nameKey="gender"
                  cx="50%" cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                >
                  {genders.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number, name: string) => [v, name]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="two-col" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Top Conditions</div>
          {topConditions.length === 0 ? emptyNote('No conditions recorded yet.') : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={topConditions} layout="vertical" margin={{ left: 110, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="condition" tick={{ fontSize: 11, fill: 'var(--text)' }} axisLine={false} tickLine={false} width={110} />
                <Tooltip formatter={(v: number) => [v, 'Patients']} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {topConditions.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Doctor Workload</div>
          {doctors.length === 0 ? emptyNote('No doctors assigned yet.') : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {['Doctor', 'Patients', 'Active', 'Share'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((d, i) => {
                    const share = Math.round((d.patients / patients.length) * 100);
                    return (
                      <tr key={d.name} style={{ borderBottom: i < doctors.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                        <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text)' }}>{d.name}</td>
                        <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{d.patients}</td>
                        <td style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{d.active}</td>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${share}%`, height: '100%', background: '#4CAF7D', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', minWidth: 32 }}>{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MedicalLayout>
  );
}
