import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle2, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { MedicalStatCard } from '../../components/medical/MedicalStatCard';
import { DataTable } from '../../components/shared/DataTable/DataTable';
import { sortRows, type SortState } from '../../components/shared/DataTable/sortRows';
import { Badge } from '../../components/shared/Badge';
import { Avatar } from '../../components/shared/Avatar';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage } from '../../components/shared/apiHelpers';
import {
  MEDICAL_DOMAIN, countBy, fetchPatients, isBookedSlot, isNewThisMonth, toAppointmentSlots, type AppointmentSlot,
} from '../../components/medical/patientData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatDate, formatRelativeTime, toLocalIsoDate } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import type { Column } from '../../components/shared/DataTable/DataTable';
import type { Patient } from '../../types';
import { MEDICAL_ROUTES } from '../../lib/constants';

const colors = ['#CE7A35', '#78CEE6', '#4CAF7D', '#E8A838', '#D95C5C', '#6B6560', '#9B8E87', '#C8AF99'];
const STATUS_COLORS: Record<Patient['status'], string> = { Active: '#4CAF7D', Pending: '#E8A838', Discharged: '#9B8E87' };
const RECENT_LIMIT = 8;

const HONORIFICS = /^(dr|mr|mrs|ms|miss|mx|prof|sir|madam)\.?$/i;

/** "Dr. Alex Morgan" → "Alex"; falls back to "Doctor" when no usable name exists. */
function greetingName(name: string | null | undefined) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return parts.find(part => !HONORIFICS.test(part)) ?? 'Doctor';
}

type RecentRow = { id: string; name: string; condition: string; doctor: string; date: string; status: Patient['status'] };
type SlotState = { rows: AppointmentSlot[]; error: string | null };

export function MedicalHome() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotState>({ rows: [], error: null });
  const [isLoading, setIsLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [sort, setSort] = useState<SortState>(null);

  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setPatientsError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    const today = toLocalIsoDate();
    let ignore = false;

    const loadDashboard = async () => {
      setIsLoading(true);
      setPatientsError(null);
      // Patients and today's schedule load independently so one failing endpoint doesn't blank the dashboard
      const [patientsRes, slotsRes] = await Promise.allSettled([
        fetchPatients(userId),
        api.getAppointmentsForDate(today, MEDICAL_DOMAIN, userId),
      ]);
      if (ignore) return;

      if (patientsRes.status === 'fulfilled') {
        setPatients(patientsRes.value);
      } else {
        console.error('[MedicalHome] Patients error:', patientsRes.reason);
        setPatients([]);
        setPatientsError(errorMessage(patientsRes.reason, 'Could not load your patients.'));
      }

      if (slotsRes.status === 'fulfilled') {
        setSlots({ rows: toAppointmentSlots(Array.isArray(slotsRes.value) ? slotsRes.value : [], today), error: null });
      } else {
        console.error('[MedicalHome] Appointments error:', slotsRes.reason);
        setSlots({ rows: [], error: errorMessage(slotsRes.reason, "Could not load today's appointments.") });
      }

      setLoadedAt(new Date().toISOString());
      setIsLoading(false);
    };

    loadDashboard();
    return () => { ignore = true; };
  }, [user?.id, authLoading, reloadKey]);

  const retry = user?.id ? () => setReloadKey(k => k + 1) : undefined;

  // Most recent activity first (last visit, else registration date); the API returns newest last
  const recentRows = useMemo<RecentRow[]>(() => {
    const rows = [...patients].reverse().map(p => ({
      id: p.id,
      name: p.name,
      condition: p.primaryCondition,
      doctor: p.doctor,
      date: p.lastVisit || p.createdAt,
      status: p.status,
    }));
    return sortRows(rows, { key: 'date', dir: 'desc' }).slice(0, RECENT_LIMIT);
  }, [patients]);
  const sortedRecent = useMemo(() => sortRows(recentRows, sort), [recentRows, sort]);

  const topConditions = useMemo(
    () => countBy(patients, p => p.primaryCondition).slice(0, 6).map(c => ({ condition: c.label, count: c.count })),
    [patients],
  );

  const statusCounts = useMemo(
    () => (['Active', 'Pending', 'Discharged'] as const).map(status => ({
      status,
      count: patients.filter(p => p.status === status).length,
    })),
    [patients],
  );

  const bookedToday = slots.rows.filter(isBookedSlot);
  const finalizedToday = bookedToday.filter(s => s.locked).length;
  const newThisMonth = patients.filter(p => isNewThisMonth(p)).length;
  const activeCount = statusCounts[0].count;

  const onScheduleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      navigate(MEDICAL_ROUTES.APPOINTMENTS);
    }
  };

  const columns: Column<RecentRow>[] = [
    {
      key: 'name', header: 'Patient', sortable: true,
      render: (_, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar name={row.name} size="sm" />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{row.name || '—'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{row.id}</div>
          </div>
        </div>
      ),
    },
    { key: 'condition', header: 'Condition', sortable: true, render: v => (v ? String(v) : '—') },
    { key: 'doctor', header: 'Doctor', sortable: true, render: v => (v ? String(v) : '—') },
    { key: 'date', header: 'Last Activity', sortable: true, render: v => formatDate(v as string, 'short') },
    { key: 'status', header: 'Status', render: v => <Badge status={v as Patient['status']} size="sm" withDot={v === 'Active'} /> },
  ];

  const title = `Good ${greeting}, ${greetingName(user?.name)}`;

  if (isLoading) {
    return (
      <MedicalLayout title={title} actionLabel="Add Patient" actionPath={MEDICAL_ROUTES.ADD_PATIENT}>
        <LoadingState label="Loading your dashboard..." padding="100px 0" />
      </MedicalLayout>
    );
  }

  return (
    <MedicalLayout title={title} actionLabel="Add Patient" actionPath={MEDICAL_ROUTES.ADD_PATIENT}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {patientsError && <ErrorBanner message={patientsError} onRetry={retry} />}

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {!patientsError && (
          <>
            <MedicalStatCard
              title="Total Patients" value={patients.length}
              trend={newThisMonth > 0 ? 'up' : 'neutral'} trendValue={`+${newThisMonth} this month`}
              icon={<Users size={18} />} index={0}
            />
            <MedicalStatCard
              title="Active Patients" value={activeCount}
              trend="neutral" trendValue={patients.length ? `${Math.round((activeCount / patients.length) * 100)}% of all patients` : 'No patients yet'}
              icon={<Activity size={18} />} index={1}
            />
          </>
        )}
        {!slots.error && (
          <>
            <MedicalStatCard
              title="Appointments Today" value={bookedToday.length}
              trend="neutral" trendValue={`of ${slots.rows.length} slots`}
              icon={<Calendar size={18} />} index={2}
            />
            <MedicalStatCard
              title="Finalized Today" value={finalizedToday}
              trend="neutral" trendValue={`of ${bookedToday.length} booked`}
              icon={<CheckCircle2 size={18} />} index={3}
            />
          </>
        )}
      </div>

      {/* Row 2 */}
      <div className="two-col-wide" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Recent Patients</div>
              <div className="card-subtitle">Latest visits and registrations</div>
            </div>
            <button className="btn-ghost btn-sm" onClick={() => navigate(MEDICAL_ROUTES.PATIENTS)}>View all</button>
          </div>
          <DataTable
            data={sortedRecent}
            columns={columns}
            onRowClick={row => navigate(`${MEDICAL_ROUTES.PATIENTS}/${encodeURIComponent(row.id)}`)}
            rowKey="id"
            sort={sort}
            onSortChange={setSort}
            emptyTitle={patientsError ? 'Patients could not be loaded.' : 'No patients yet.'}
            emptyDescription={patientsError ? undefined : 'Patients you add will appear here.'}
          />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Today's Schedule</div>
            <button className="btn-ghost btn-sm" onClick={() => navigate(MEDICAL_ROUTES.APPOINTMENTS)}>Full calendar</button>
          </div>
          {slots.error && <ErrorBanner message={slots.error} onRetry={retry} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!slots.error && bookedToday.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '12px 0' }}>No appointments booked for today.</div>
            )}
            {bookedToday.slice(0, 8).map((slot, i) => {
              const label = slot.name || 'Unnamed patient';
              const status = slot.locked ? 'Completed' : 'Scheduled';
              return (
                <motion.div
                  key={slot.no}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="medical-clickable-row"
                  role="button"
                  tabIndex={0}
                  aria-label={`${slot.time || `Slot ${slot.no}`} ${label}, ${status}. Open appointments`}
                  onKeyDown={onScheduleKeyDown}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: '1px solid var(--border-light)',
                    background: slot.locked ? 'var(--surface-alt)' : 'var(--surface)',
                    borderLeft: `3px solid ${slot.locked ? '#4CAF7D' : 'var(--accent)'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(MEDICAL_ROUTES.APPOINTMENTS)}
                >
                  <div style={{ width: 50, fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>{slot.time || `#${slot.no}`}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</div>
                    {slot.msg && <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.msg}</div>}
                  </div>
                  <Badge status={status} size="sm" />
                </motion.div>
              );
            })}
            <button
              className="btn-ghost btn-sm"
              style={{ width: '100%', marginTop: 4 }}
              onClick={() => navigate(MEDICAL_ROUTES.APPOINTMENTS)}
            >
              + Add appointment
            </button>
          </div>
        </div>
      </div>

      {/* Row 3 */}
      {!patientsError && (
        <div className="two-col" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Top Conditions</div>
            {topConditions.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>No conditions recorded yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topConditions} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="condition" tick={{ fontSize: 11, fill: 'var(--text)' }} axisLine={false} tickLine={false} width={100} />
                  <Tooltip
                    formatter={(v: number) => [v, 'Patients']}
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 12 }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {topConditions.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Patient Status</div>
            {patients.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '24px 0', textAlign: 'center' }}>No patients yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {statusCounts.map(({ status, count }) => {
                  const pct = Math.round((count / patients.length) * 100);
                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, color: 'var(--text)' }}>{status}</span>
                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{count} · {pct}%</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: STATUS_COLORS[status], borderRadius: 4, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Showing {sortedRecent.length} of {patients.length} patients. Last updated {formatRelativeTime(loadedAt)}.
      </div>
    </MedicalLayout>
  );
}
