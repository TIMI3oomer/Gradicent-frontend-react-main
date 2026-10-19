import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage } from '../../components/shared/apiHelpers';
import { formatDate, toLocalIsoDate } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const START_HOUR = 8;
const HOUR_COUNT = 10;
const HOURS = Array.from({ length: HOUR_COUNT }, (_, i) => i + START_HOUR);
const HOUR_HEIGHT = 56;
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DEFAULT_COLOR = '#1171BB';

type BizAppointment = {
  id: string;
  title: string;
  date: string;          // local YYYY-MM-DD
  time: string | null;   // HH:MM, null when the slot has no time
  duration: number;      // minutes
  status?: string;
  location?: string;
  hostName?: string;
  colorCode: string;
};

function getWeekDates(start: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function getMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * The binder returns per-day appointment "slots" whose shape varies ({ no, name, phone, msg }
 * or full appointment objects). Normalise them into something the calendar can place.
 */
function normalizeAppointment(raw: unknown, requestedDate: string, index: number): BizAppointment | null {
  if (!raw || typeof raw !== 'object') return null;
  const e = raw as Record<string, unknown>;
  if (String(e.type ?? '').toLowerCase() === 'medical') return null;

  const title = optionalText(e.title) ?? optionalText(e.name) ?? optionalText(e.clientName) ?? optionalText(e.attendeeName);
  if (!title) return null; // empty slot

  const timeMatch = /^(\d{1,2}):(\d{2})/.exec(String(e.time ?? e.startTime ?? e.start ?? ''));
  const time = timeMatch ? `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}` : null;
  const duration = Number(e.duration);
  const color = String(e.colorCode ?? '');
  const date = typeof e.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.date) ? e.date : requestedDate;

  return {
    id: `${requestedDate}-${String(e.id ?? e.no ?? index)}`,
    title,
    date,
    time,
    duration: Number.isFinite(duration) && duration > 0 ? duration : 30,
    status: optionalText(e.status),
    location: optionalText(e.location),
    hostName: optionalText(e.hostName),
    colorCode: /^#[0-9a-f]{6}$/i.test(color) ? color : DEFAULT_COLOR,
  };
}

function minutesFromGridStart(time: string) {
  const [h, m] = time.split(':').map(Number);
  return (h - START_HOUR) * 60 + m;
}

/** Whether a timed appointment falls inside the visible hour grid. */
function isOnGrid(apt: BizAppointment) {
  if (!apt.time) return false;
  const start = minutesFromGridStart(apt.time);
  return start >= 0 && start < HOUR_COUNT * 60;
}

export function BusinessAppointments() {
  const { user, isLoading: authLoading } = useAuth();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [view, setView] = useState<'week' | 'list'>('week');

  const [appointments, setAppointments] = useState<BizAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const todayIso = toLocalIsoDate();

  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    const dates = getWeekDates(weekStart).map(d => toLocalIsoDate(d));
    let ignore = false;

    const fetchWeekAppointments = async () => {
      setIsLoading(true);
      setError(null);
      // The binder only exposes appointments per day, so fetch all 7 days concurrently
      const results = await Promise.allSettled(dates.map(ds => api.getAppointmentsForDate(ds, 'business', userId)));
      if (ignore) return;

      const loaded: BizAppointment[] = [];
      let failures = 0;
      let firstError: unknown = null;
      results.forEach((result, di) => {
        if (result.status === 'fulfilled') {
          (Array.isArray(result.value) ? result.value : []).forEach((raw, i) => {
            const apt = normalizeAppointment(raw, dates[di], i);
            if (apt) loaded.push(apt);
          });
        } else {
          failures += 1;
          firstError ??= result.reason;
        }
      });

      if (failures > 0) {
        console.error('[Appointments] Error:', firstError);
        setError(failures === dates.length
          ? `Appointments could not be loaded: ${errorMessage(firstError, 'unknown error')}`
          : `Some days in this week could not be loaded (${failures} of ${dates.length}).`);
      }
      setAppointments(loaded);
      setIsLoading(false);
    };
    fetchWeekAppointments();
    return () => { ignore = true; };
  }, [weekStart, user?.id, authLoading, reloadKey]);

  const shiftWeek = (days: number) => setWeekStart(prev => {
    const d = new Date(prev);
    d.setDate(d.getDate() + days);
    return d;
  });
  const goToday = () => setWeekStart(getMonday(new Date()));

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => (a.date + (a.time ?? '99:99')).localeCompare(b.date + (b.time ?? '99:99'))),
    [appointments],
  );
  const aptsForDay = (iso: string) => sorted.filter(a => a.date === iso);
  const unscheduledCount = sorted.filter(a => !isOnGrid(a)).length;

  const rangeLabel = `${formatDate(toLocalIsoDate(weekDates[0]), 'short')} — ${formatDate(toLocalIsoDate(weekDates[6]), 'short')}`;

  return (
    <BusinessLayout title="Appointments">
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn-ghost btn-sm" onClick={() => shiftWeek(-7)} aria-label="Previous week"><ChevronLeft size={14} aria-hidden="true" /></button>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', minWidth: 180, textAlign: 'center' }} aria-live="polite">
            {rangeLabel}
          </div>
          <button type="button" className="btn-ghost btn-sm" onClick={() => shiftWeek(7)} aria-label="Next week"><ChevronRight size={14} aria-hidden="true" /></button>
          <button type="button" className="btn-ghost btn-sm" onClick={goToday}>Today</button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }} role="group" aria-label="View">
          <button type="button" className={view === 'week' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setView('week')} style={{ padding: '4px 8px' }} aria-label="Week view" aria-pressed={view === 'week'}><Calendar size={14} aria-hidden="true" /></button>
          <button type="button" className={view === 'list' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setView('list')} style={{ padding: '4px 8px' }} aria-label="List view" aria-pressed={view === 'list'}><List size={14} aria-hidden="true" /></button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

      {isLoading ? (
        <LoadingState label="Loading appointments..." padding={48} />
      ) : view === 'week' ? (
        <>
          <div className="card" style={{ padding: 0, overflow: 'auto' }}>
            <div className="biz-week-grid">
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, minmax(0, 1fr))', borderBottom: '1px solid var(--border)' }}>
                <div style={{ borderRight: '1px solid var(--border-light)' }} />
                {weekDates.map((d, i) => {
                  const isToday = toLocalIsoDate(d) === todayIso;
                  return (
                    <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < 6 ? '1px solid var(--border-light)' : 'none', background: isToday ? 'var(--primary-light)' : 'transparent' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{DAYS[d.getDay()]}</div>
                      <div style={{ fontSize: 16, fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--primary)' : 'var(--text)' }}>{d.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Appointments without a time (or outside the visible hours) */}
              {unscheduledCount > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, minmax(0, 1fr))', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '6px 8px', borderRight: '1px solid var(--border-light)' }}>Other</div>
                  {weekDates.map((d, di) => (
                    <div key={di} style={{ padding: 4, display: 'flex', flexDirection: 'column', gap: 4, borderRight: di < 6 ? '1px solid var(--border-light)' : 'none', minWidth: 0 }}>
                      {aptsForDay(toLocalIsoDate(d)).filter(a => !isOnGrid(a)).map(apt => (
                        <div
                          key={apt.id}
                          title={`${apt.time ? `${apt.time} · ` : ''}${apt.title}`}
                          style={{ fontSize: 10, color: 'white', background: apt.colorCode, borderRadius: 4, padding: '2px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {apt.time ? `${apt.time} ` : ''}{apt.title}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Time grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, minmax(0, 1fr))', position: 'relative' }}>
                {HOURS.map(h => (
                  <div key={h} style={{ display: 'contents' }}>
                    <div style={{ padding: '4px 8px 0', height: HOUR_HEIGHT, display: 'flex', alignItems: 'flex-start', borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{h}:00</span>
                    </div>
                    {weekDates.map((_, di) => (
                      <div key={di} style={{ height: HOUR_HEIGHT, borderRight: di < 6 ? '1px solid var(--border-light)' : 'none', borderBottom: '1px solid var(--border-light)' }} />
                    ))}
                  </div>
                ))}
                {/* Appointments overlay */}
                {weekDates.map((d, di) => aptsForDay(toLocalIsoDate(d)).filter(isOnGrid).map(apt => {
                  const startMin = minutesFromGridStart(apt.time as string);
                  const totalMin = HOUR_COUNT * 60;
                  const heightMin = Math.max(15, Math.min(apt.duration, totalMin - startMin));
                  return (
                    <div
                      key={apt.id}
                      title={`${apt.time} · ${apt.title}${apt.location ? ` · ${apt.location}` : ''}`}
                      style={{
                        position: 'absolute',
                        top: `${(startMin / totalMin) * 100}%`,
                        height: `${(heightMin / totalMin) * 100}%`,
                        left: `calc(56px + ${di} * (100% - 56px) / 7 + 2px)`,
                        width: 'calc((100% - 56px) / 7 - 4px)',
                        background: `${apt.colorCode}CC`,
                        borderLeft: `3px solid ${apt.colorCode}`,
                        borderRadius: 4,
                        padding: '3px 6px',
                        overflow: 'hidden',
                        zIndex: 1,
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{apt.time}</div>
                      <div style={{ fontSize: 10, color: 'white', opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.title}</div>
                    </div>
                  );
                }))}
              </div>
            </div>
          </div>
          {!error && appointments.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>No appointments this week.</div>
          )}
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No appointments this week.</div>
          ) : (
            sorted.map(apt => (
              <div key={apt.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px' }}>
                <div style={{ width: 4, alignSelf: 'stretch', minHeight: 44, background: apt.colorCode, borderRadius: 2, flexShrink: 0 }} aria-hidden="true" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{apt.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {[formatDate(apt.date, 'long'), apt.time ?? 'No time set', `${apt.duration} min`, apt.location].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {apt.status && <Badge status={apt.status as BadgeVariant} size="sm" />}
                  {apt.hostName && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{apt.hostName}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </BusinessLayout>
  );
}
