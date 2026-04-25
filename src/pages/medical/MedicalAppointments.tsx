import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, Lock, RefreshCcw, Save, Search, UserCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { Badge } from '../../components/shared/Badge';
import { formatDate } from '../../lib/formatters';
import {
  fetchDomain,
  fetchUserId,
  getAppointmentsForDate,
  lockAppointment,
  saveAppointments,
  trackUsageTime,
} from '../../lib/api';

type AppointmentSlot = {
  no: string | number;
  name: string;
  phone: string;
  msg: string;
  locked?: boolean;
  [key: string]: unknown;
};

type FilterMode = 'all' | 'has' | 'none';

function isoToday() {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
}

function normalizeSlot(slot: unknown, index: number): AppointmentSlot {
  const entry = (slot ?? {}) as Record<string, unknown>;
  const rawNo = entry.no ?? entry.number ?? entry.id ?? index + 1;

  return {
    ...entry,
    no: typeof rawNo === 'string' || typeof rawNo === 'number' ? rawNo : index + 1,
    name: String(entry.name ?? entry.clientName ?? entry.attendeeName ?? 'Unknown'),
    phone: String(entry.phone ?? entry.mobile ?? ''),
    msg: String(entry.msg ?? entry.message ?? ''),
    locked: Boolean(entry.locked ?? entry.isLocked ?? entry.finalized ?? false),
  };
}

export function MedicalAppointments() {
  const [dateIso, setDateIso] = useState(isoToday());
  const [currentUserId, setCurrentUserId] = useState<string | number | null>(null);
  const [currentDomain, setCurrentDomain] = useState('medical');
  const [appointments, setAppointments] = useState<AppointmentSlot[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [userId, domain] = await Promise.all([fetchUserId(), fetchDomain()]);
        if (cancelled) return;
        setCurrentUserId((userId as string | number | null) ?? null);
        setCurrentDomain(domain || 'medical');
      } catch (error) {
        if (!cancelled) {
          setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load session' });
        }
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!currentDomain) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getAppointmentsForDate(dateIso, currentDomain, currentUserId);
        if (cancelled) return;
        setAppointments((Array.isArray(result) ? result : []).map(normalizeSlot));
        setStatus({ type: 'success', message: 'Appointments loaded' });
      } catch (error) {
        if (!cancelled) {
          setAppointments([]);
          setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to load appointments' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [dateIso, currentDomain, currentUserId]);

  useEffect(() => {
    let seconds = 0;
    let active = true;

    const onVisibility = () => {
      active = !document.hidden;
    };

    const onBlur = () => {
      active = false;
    };

    const onFocus = () => {
      active = true;
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    const timer = window.setInterval(() => {
      if (active) seconds += 1;
    }, 1000);

    const flush = () => {
      if (seconds > 0) void trackUsageTime(seconds);
    };

    window.addEventListener('beforeunload', flush);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('beforeunload', flush);
      window.clearInterval(timer);
      flush();
    };
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((slot) => {
      const hasMessage = slot.msg.trim().length > 0;
      if (filter === 'has') return hasMessage;
      if (filter === 'none') return !hasMessage;
      return true;
    });
  }, [appointments, filter]);

  const updateSlot = (index: number, key: 'name' | 'phone' | 'msg', value: string) => {
    setAppointments((current) => current.map((slot, slotIndex) => (slotIndex === index ? { ...slot, [key]: value } : slot)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAppointments(dateIso, appointments, currentDomain, currentUserId);
      setStatus({ type: 'success', message: 'Appointments saved' });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to save appointments' });
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async (slot: AppointmentSlot) => {
    try {
      await lockAppointment(slot.no, currentDomain, dateIso, currentUserId);
      setAppointments((current) => current.map((item) => (String(item.no) === String(slot.no) ? { ...item, locked: true } : item)));
      setStatus({ type: 'success', message: `Appointment ${slot.no} locked` });
    } catch (error) {
      setStatus({ type: 'error', message: error instanceof Error ? error.message : 'Failed to lock appointment' });
    }
  };

  const handleClear = () => {
    setAppointments((current) => current.map((slot) => ({ ...slot, msg: '' })));
    setStatus({ type: 'info', message: 'Messages cleared locally' });
  };

  return (
    <MedicalLayout title="Appointments" breadcrumb="Binder scheduling">
      <div className="medical-appointments-shell">
        <div className="medical-appointments-toolbar card">
          <div className="medical-appointments-toolbar__group">
            <label className="medical-field-label" htmlFor="appointment-date">Date</label>
            <div className="medical-date-field">
              <Calendar size={16} />
              <input
                id="appointment-date"
                className="medical-date-input"
                type="date"
                value={dateIso}
                onChange={(event) => setDateIso(event.target.value)}
              />
            </div>
          </div>

          <div className="medical-appointments-toolbar__group">
            <label className="medical-field-label" htmlFor="appointment-filter">Filter</label>
            <div className="medical-date-field">
              <Search size={16} />
              <select
                id="appointment-filter"
                className="medical-date-input"
                value={filter}
                onChange={(event) => setFilter(event.target.value as FilterMode)}
              >
                <option value="all">All</option>
                <option value="has">Has message</option>
                <option value="none">No message</option>
              </select>
            </div>
          </div>

          <div className="medical-appointments-toolbar__actions">
            <button className="btn-ghost btn-sm" onClick={() => setDateIso(isoToday())}>
              Today
            </button>
            <button className="btn-ghost btn-sm" onClick={() => setStatus({ type: 'info', message: `Viewing ${formatDate(dateIso, 'medium')}` })}>
              <RefreshCcw size={14} />
              Refresh
            </button>
            <button className="btn-primary btn-sm" onClick={handleSave} disabled={saving || loading}>
              <Save size={14} />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {status ? <div className={`medical-status-banner medical-status-${status.type}`}>{status.message}</div> : null}

        <div className="medical-appointments-summary">
          <div className="card medical-summary-card">
            <div className="medical-summary-label">Date</div>
            <div className="medical-summary-value">{formatDate(dateIso, 'medium')}</div>
          </div>
          <div className="card medical-summary-card">
            <div className="medical-summary-label">Visible slots</div>
            <div className="medical-summary-value">{filteredAppointments.length}</div>
          </div>
          <div className="card medical-summary-card">
            <div className="medical-summary-label">Working copy</div>
            <div className="medical-summary-value">{appointments.length}</div>
          </div>
          <div className="card medical-summary-card">
            <div className="medical-summary-label">Domain</div>
            <div className="medical-summary-value">{currentDomain}</div>
          </div>
        </div>

        <div className="medical-appointments-list">
          {loading ? (
            <div className="card medical-empty-state">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="card medical-empty-state">No appointments found for this date.</div>
          ) : (
            filteredAppointments.map((slot, index) => (
              <motion.div
                key={`${slot.no}-${index}`}
                className="card medical-appointment-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18, delay: index * 0.02 }}
              >
                <div className="medical-appointment-card__head">
                  <div>
                    <div className="medical-appointment-name">{slot.name}</div>
                    <div className="medical-appointment-meta">
                      <span>No. {slot.no}</span>
                      <span>{slot.phone || 'No phone'}</span>
                    </div>
                  </div>
                  <div className="medical-appointment-badges">
                    {slot.locked ? <Badge status="success" size="sm">Locked</Badge> : <Badge status="info" size="sm">Open</Badge>}
                    <button className="btn-ghost btn-sm" onClick={() => void handleLock(slot)} disabled={slot.locked}>
                      <Lock size={14} />
                      Lock
                    </button>
                  </div>
                </div>

                <div className="medical-appointment-grid">
                  <label className="medical-input-group">
                    <span className="medical-field-label">Name</span>
                    <div className="medical-input-with-icon">
                      <UserCircle2 size={16} />
                      <input
                        className="medical-date-input"
                        value={slot.name}
                        onChange={(event) => updateSlot(index, 'name', event.target.value)}
                      />
                    </div>
                  </label>

                  <label className="medical-input-group">
                    <span className="medical-field-label">Phone</span>
                    <input
                      className="medical-date-input"
                      value={slot.phone}
                      onChange={(event) => updateSlot(index, 'phone', event.target.value)}
                    />
                  </label>
                </div>

                <label className="medical-input-group">
                  <span className="medical-field-label">Message</span>
                  <textarea
                    className="medical-message-box"
                    rows={4}
                    value={slot.msg}
                    onChange={(event) => updateSlot(index, 'msg', event.target.value)}
                  />
                </label>

                <div className="medical-appointment-actions">
                  <button className="btn-ghost btn-sm" onClick={handleClear}>
                    Clear all messages
                  </button>
                  <button className="btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                    <Check size={14} />
                    Save
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </MedicalLayout>
  );
}
