import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge } from '../../components/shared/Badge';
import { mockAppointments } from '../../data/appointments';
import { formatDate } from '../../lib/formatters';

const HOURS = Array.from({ length: 10 }, (_, i) => i + 8);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
  return d;
}

const businessApts = mockAppointments.filter(a => a.type === 'Business');

export function BusinessAppointments() {
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [view, setView] = useState<'week' | 'list'>('week');

  const weekDates = getWeekDates(weekStart);

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const goToday = () => setWeekStart(getMonday(new Date()));

  const getApts = (date: Date) => {
    const ds = date.toISOString().split('T')[0];
    return mockAppointments.filter(a => a.date === ds && a.type === 'Business');
  };

  const getTopPct = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 8) * 60 + m) / (10 * 60) * 100;
  };

  const getHeightPct = (duration: number) => (duration / (10 * 60)) * 100;

  return (
    <BusinessLayout title="Appointments">
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn-ghost btn-sm" onClick={prevWeek}><ChevronLeft size={14} /></button>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', minWidth: 200, textAlign: 'center' }}>
            {formatDate(weekDates[0].toISOString().split('T')[0], 'short')} — {formatDate(weekDates[6].toISOString().split('T')[0], 'short')}
          </div>
          <button className="btn-ghost btn-sm" onClick={nextWeek}><ChevronRight size={14} /></button>
          <button className="btn-ghost btn-sm" onClick={goToday}>Today</button>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6, padding: 2 }}>
          <button className={view === 'week' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setView('week')} style={{ padding: '4px 8px' }}><Calendar size={14} /></button>
          <button className={view === 'list' ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setView('list')} style={{ padding: '4px 8px' }}><List size={14} /></button>
        </div>
      </div>

      {view === 'week' ? (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ borderRight: '1px solid var(--border-light)' }} />
            {weekDates.map((d, i) => {
              const isToday = d.toDateString() === new Date().toDateString();
              return (
                <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < 6 ? '1px solid var(--border-light)' : 'none', background: isToday ? 'var(--primary)' + '10' : 'transparent' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{DAYS[d.getDay()]}</div>
                  <div style={{ fontSize: 16, fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--primary)' : 'var(--text)' }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>
          {/* Time grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', position: 'relative' }}>
            {/* Hour rows */}
            {HOURS.map(h => (
              <div key={h} style={{ display: 'contents' }}>
                <div style={{ padding: '0 8px', height: 56, display: 'flex', alignItems: 'flex-start', paddingTop: 4, borderRight: '1px solid var(--border-light)', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{h}:00</span>
                </div>
                {weekDates.map((_, di) => (
                  <div key={di} style={{ height: 56, borderRight: di < 6 ? '1px solid var(--border-light)' : 'none', borderBottom: '1px solid var(--border-light)', position: 'relative' }} />
                ))}
              </div>
            ))}
            {/* Appointments overlay */}
            {weekDates.map((d, di) => {
              const apts = getApts(d);
              return apts.map(apt => (
                <div
                  key={apt.id}
                  style={{
                    position: 'absolute',
                    top: `${getTopPct(apt.time)}%`,
                    height: `${getHeightPct(apt.duration)}%`,
                    left: `calc(56px + ${di} * (100% - 56px) / 7 + 2px)`,
                    width: `calc((100% - 56px) / 7 - 4px)`,
                    background: apt.colorCode + 'CC',
                    borderLeft: `3px solid ${apt.colorCode}`,
                    borderRadius: 4,
                    padding: '3px 6px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    zIndex: 1,
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{apt.time}</div>
                  <div style={{ fontSize: 10, color: 'white', opacity: 0.9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{apt.title}</div>
                </div>
              ));
            })}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {businessApts.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No appointments found.</div>
          ) : (
            businessApts.sort((a, b) => a.date.localeCompare(b.date)).map(apt => (
              <div key={apt.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px' }}>
                <div style={{ width: 4, height: 44, background: apt.colorCode, borderRadius: 2, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{apt.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(apt.date, 'long')} · {apt.time} · {apt.duration}min · {apt.location}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Badge status={apt.status as 'Scheduled' | 'Completed' | 'Cancelled'} size="sm" />
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{apt.hostName}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </BusinessLayout>
  );
}
