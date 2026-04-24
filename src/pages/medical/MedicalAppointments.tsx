import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { Badge } from '../../components/shared/Badge';
import { mockAppointments } from '../../data/appointments';
import { formatDate } from '../../lib/formatters';

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8am-6pm
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(offset: number) {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function MedicalAppointments() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<'week' | 'list'>('week');
  const weekDates = getWeekDates(weekOffset);

  const medAppts = mockAppointments.filter(a => a.type === 'Medical');

  const getApptForDayHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return medAppts.filter(a => {
      const apptHour = parseInt(a.time.split(':')[0]);
      return a.date === dateStr && apptHour === hour;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <MedicalLayout title="Appointments">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="topbar-icon-btn" onClick={() => setWeekOffset(o => o - 1)} aria-label="Previous week">
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-lora)', minWidth: 200, textAlign: 'center' }}>
            {formatDate(weekDates[0].toISOString(), 'short')} – {formatDate(weekDates[6].toISOString(), 'short')}, {weekDates[0].getFullYear()}
          </span>
          <button className="topbar-icon-btn" onClick={() => setWeekOffset(o => o + 1)} aria-label="Next week">
            <ChevronRight size={16} />
          </button>
          <button className="btn-ghost btn-sm" onClick={() => setWeekOffset(0)}>Today</button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
            {(['week', 'list'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: view === v ? 'var(--accent)' : 'transparent',
                  color: view === v ? 'white' : 'var(--text-muted)',
                  border: 'none', textTransform: 'capitalize',
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Plus size={14} /> New Appointment
          </button>
        </div>
      </div>

      {view === 'week' ? (
        <div className="card" style={{ overflowX: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', minWidth: 700 }}>
            {/* Header row */}
            <div style={{ borderBottom: '1px solid var(--border)', padding: '8px 0' }} />
            {weekDates.map((date, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '10px 4px', borderBottom: '1px solid var(--border)', background: isToday(date) ? 'var(--accent-light)' : 'transparent' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{DAYS[i]}</div>
                <div style={{
                  fontSize: 18, fontWeight: 700,
                  fontFamily: 'var(--font-lora)',
                  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '50%', margin: '4px auto 0',
                  background: isToday(date) ? 'var(--accent)' : 'transparent',
                  color: isToday(date) ? 'white' : 'var(--text)',
                }}>
                  {date.getDate()}
                </div>
              </div>
            ))}

            {/* Time slots */}
            {HOURS.map(hour => (
              <>
                <div key={`h${hour}`} style={{ padding: '0 8px', textAlign: 'right', borderBottom: '1px solid var(--border-light)', fontSize: 11, color: 'var(--text-light)', paddingTop: 4, height: 64, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
                  {hour > 12 ? `${hour - 12}pm` : hour === 12 ? '12pm' : `${hour}am`}
                </div>
                {weekDates.map((date, di) => {
                  const appts = getApptForDayHour(date, hour);
                  return (
                    <div key={`${hour}-${di}`} style={{ borderBottom: '1px solid var(--border-light)', borderLeft: '1px solid var(--border-light)', height: 64, position: 'relative', padding: '2px', background: isToday(date) ? 'rgba(206,122,53,0.02)' : 'transparent' }}>
                      {appts.map(appt => (
                        <motion.div
                          key={appt.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="appointment-slot"
                          style={{ background: appt.colorCode, opacity: appt.status === 'Completed' ? 0.6 : 1 }}
                          title={`${appt.attendeeName} — ${appt.appointmentType}`}
                        >
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 10 }}>{appt.attendeeName}</div>
                          <div style={{ fontSize: 9, opacity: 0.85 }}>{appt.appointmentType}</div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {medAppts.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)).map((appt, i) => (
              <motion.div
                key={appt.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-light)', borderLeft: `3px solid ${appt.colorCode}` }}
              >
                <div style={{ width: 80, fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{formatDate(appt.date, 'short')}</div>
                <div style={{ width: 50, fontSize: 12, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>{appt.time}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{appt.attendeeName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{appt.appointmentType} · {appt.hostName} · {appt.duration}min</div>
                </div>
                <Badge status={appt.status} size="sm" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </MedicalLayout>
  );
}
