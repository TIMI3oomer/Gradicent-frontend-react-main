import { useEffect, useMemo, useState } from 'react';
import { Calendar, Eraser, Lock, RefreshCcw, Save, Search, UserCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { Badge } from '../../components/shared/Badge';
import { formatDate, parseDate, toLocalIsoDate } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import { errorMessage } from '../../components/shared/apiHelpers';
import {
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

// This page always works against the medical binder; never fall back to another domain.
const DOMAIN = 'medical';

function isoToday() {
  return toLocalIsoDate();
}

function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && parseDate(value) !== null;
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
  const { user } = useAuth();
  const currentUserId = user?.id ?? null;
  const [dateIso, setDateIso] = useState(isoToday());
  const [appointments, setAppointments] = useState<AppointmentSlot[]>([]);
  const [filter, setFilter] = useState<FilterMode>('all');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);

  const dateIsValid = isValidIsoDate(dateIso);

  useEffect(() => {
    if (!dateIsValid) {
      setAppointments([]);
      setLoading(false);
      setStatus({ type: 'info', message: 'Pick a date to load appointments.' });
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getAppointmentsForDate(dateIso, DOMAIN, currentUserId);
        if (cancelled) return;
        setAppointments((Array.isArray(result) ? result : []).map(normalizeSlot));
        setStatus({ type: 'success', message: 'Appointments loaded' });
      } catch (error) {
        if (!cancelled) {
          setAppointments([]);
          setStatus({ type: 'error', message: errorMessage(error, 'Failed to load appointments') });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [dateIso, dateIsValid, currentUserId, reloadKey]);

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

  const lockedCount = appointments.filter((slot) => slot.locked).length;
  const clearableCount = appointments.filter((slot) => !slot.locked && slot.msg.length > 0).length;
  const busy = saving || loading;

  // Update by slot number, never by list index: the rendered list may be filtered.
  const updateSlot = (no: AppointmentSlot['no'], key: 'name' | 'phone' | 'msg', value: string) => {
    setAppointments((current) =>
      current.map((slot) => (String(slot.no) === String(no) && !slot.locked ? { ...slot, [key]: value } : slot)),
    );
  };

  const handleSave = async () => {
    if (!dateIsValid) return;
    setSaving(true);
    try {
      await saveAppointments(dateIso, appointments, DOMAIN, currentUserId);
      setStatus({ type: 'success', message: 'Appointments saved' });
    } catch (error) {
      setStatus({ type: 'error', message: errorMessage(error, 'Failed to save appointments') });
    } finally {
      setSaving(false);
    }
  };

  const handleLock = async (slot: AppointmentSlot) => {
    if (!dateIsValid) return;
    try {
      await lockAppointment(slot.no, DOMAIN, dateIso, currentUserId);
      setAppointments((current) => current.map((item) => (String(item.no) === String(slot.no) ? { ...item, locked: true } : item)));
      setStatus({ type: 'success', message: `Appointment ${slot.no} locked` });
    } catch (error) {
      setStatus({ type: 'error', message: errorMessage(error, 'Failed to lock appointment') });
    }
  };

  const handleClear = () => {
    setAppointments((current) => current.map((slot) => (slot.locked ? slot : { ...slot, msg: '' })));
    setStatus({ type: 'info', message: 'Messages cleared locally. Save changes to keep this.' });
  };

  const displayDate = dateIsValid ? formatDate(dateIso, 'medium') : '—';

  return (
    <MedicalLayout title="Appointments" breadcrumb="Scheduling">
      <div className="medical-appointments-shell">
        <div className="medical-appointments-toolbar card">
          <div className="medical-appointments-toolbar__group">
            <label className="medical-field-label" htmlFor="appointment-date">Date</label>
            <div className="medical-date-field">
              <Calendar size={16} aria-hidden="true" />
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
              <Search size={16} aria-hidden="true" />
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
            <button type="button" className="btn-ghost btn-sm" onClick={() => setDateIso(isoToday())}>
              Today
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => setReloadKey((key) => key + 1)}
              disabled={busy || !dateIsValid}
            >
              <RefreshCcw size={14} aria-hidden="true" />
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={handleClear}
              disabled={busy || clearableCount === 0}
              title="Clears messages on all unlocked slots"
            >
              <Eraser size={14} aria-hidden="true" />
              Clear all messages
            </button>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => void handleSave()}
              disabled={busy || !dateIsValid || appointments.length === 0}
            >
              <Save size={14} aria-hidden="true" />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>

        {status ? (
          <div
            className={`medical-status-banner medical-status-${status.type}`}
            role={status.type === 'error' ? 'alert' : 'status'}
          >
            {status.message}
          </div>
        ) : null}

        <div className="medical-appointments-summary">
          <div className="card medical-summary-card">
            <div className="medical-summary-label">Date</div>
            <div className="medical-summary-value">{displayDate}</div>
          </div>
          <div className="card medical-summary-card">
            <div className="medical-summary-label">Total slots</div>
            <div className="medical-summary-value">{appointments.length}</div>
          </div>
          <div className="card medical-summary-card">
            <div className="medical-summary-label">Showing</div>
            <div className="medical-summary-value">{filteredAppointments.length}</div>
          </div>
          <div className="card medical-summary-card">
            <div className="medical-summary-label">Locked</div>
            <div className="medical-summary-value">{lockedCount}</div>
          </div>
        </div>

        <div className="medical-appointments-list">
          {loading ? (
            <div className="card medical-empty-state">Loading appointments...</div>
          ) : !dateIsValid ? (
            <div className="card medical-empty-state">Select a date to see its appointments.</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="card medical-empty-state">
              {appointments.length === 0 ? 'No appointments found for this date.' : 'No appointments match this filter.'}
            </div>
          ) : (
            filteredAppointments.map((slot, index) => {
              const fieldId = `slot-${String(slot.no)}`;
              const locked = Boolean(slot.locked);

              return (
                <motion.div
                  key={`${slot.no}-${index}`}
                  className={`card medical-appointment-card${locked ? ' is-locked' : ''}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(index * 0.02, 0.3) }}
                >
                  <div className="medical-appointment-card__head">
                    <div>
                      <div className="medical-appointment-name">{slot.name || 'Unnamed'}</div>
                      <div className="medical-appointment-meta">
                        <span>No. {slot.no}</span>
                        <span>{slot.phone || 'No phone'}</span>
                      </div>
                    </div>
                    <div className="medical-appointment-badges">
                      {locked ? <Badge status="success" size="sm">Locked</Badge> : <Badge status="info" size="sm">Open</Badge>}
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() => void handleLock(slot)}
                        disabled={locked || busy}
                        aria-label={`Lock appointment ${slot.no}`}
                      >
                        <Lock size={14} aria-hidden="true" />
                        {locked ? 'Locked' : 'Lock'}
                      </button>
                    </div>
                  </div>

                  <div className="medical-appointment-grid">
                    <div className="medical-input-group">
                      <label className="medical-field-label" htmlFor={`${fieldId}-name`}>Name</label>
                      <div className="medical-input-with-icon">
                        <UserCircle2 size={16} aria-hidden="true" />
                        <input
                          id={`${fieldId}-name`}
                          className="medical-date-input"
                          value={slot.name}
                          readOnly={locked}
                          disabled={locked}
                          onChange={(event) => updateSlot(slot.no, 'name', event.target.value)}
                        />
                      </div>
                    </div>

                    <div className="medical-input-group">
                      <label className="medical-field-label" htmlFor={`${fieldId}-phone`}>Phone</label>
                      <input
                        id={`${fieldId}-phone`}
                        className="medical-date-input"
                        type="tel"
                        value={slot.phone}
                        readOnly={locked}
                        disabled={locked}
                        onChange={(event) => updateSlot(slot.no, 'phone', event.target.value)}
                      />
                    </div>
                  </div>

                  <div className="medical-input-group">
                    <label className="medical-field-label" htmlFor={`${fieldId}-msg`}>Message</label>
                    <textarea
                      id={`${fieldId}-msg`}
                      className="medical-message-box"
                      rows={3}
                      value={slot.msg}
                      readOnly={locked}
                      disabled={locked}
                      onChange={(event) => updateSlot(slot.no, 'msg', event.target.value)}
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </MedicalLayout>
  );
}
