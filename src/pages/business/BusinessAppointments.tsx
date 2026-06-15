import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, List } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge } from '../../components/shared/Badge';
import { formatDate } from '../../lib/formatters';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import type { Appointment } from '../../types';

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

export function BusinessAppointments() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [view, setView] = useState<'week' | 'list'>('week');
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const weekDates = getWeekDates(weekStart);

  useEffect(() => {
    const fetchWeekAppointments = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        // Fetch all 7 days concurrently
        const promises = weekDates.map(d => {
          const ds = d.toISOString().split('T')[0];
          return api.getAppointmentsForDate(ds, 'business', user.id);
        });
        
        const results = await Promise.all(promises);
        // Flatten array of arrays
        setAppointments(results.flat().filter(a => a.type === 'Business'));
      } catch (err) {
        console.error('[Appointments] Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWeekAppointments();
  }, [weekStart, user?.id]);

  const getApts = (date: Date) => {
    const ds = date.toISOString().split('T')[0];
    return appointments.filter(a => a.date === ds);
  };

  const getTopPct = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return ((h - 8) * 60 + m) / (10 * 60) * 100;
  };

  const getHeightPct = (duration: number) => (duration / (10 * 60)) * 100;

  return (
    <BusinessLayout title="Appointments">
      {/* Calendar Header / View Toggles remain identical ... */}
      
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading agenda...</div>
      ) : view === 'week' ? (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '56px repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ borderRight: '1px solid var(--border-light)' }} />
            {weekDates.map((d, i) => (
              <div key={i} style={{ padding: '12px 8px', textAlign: 'center', borderRight: i < 6 ? '1px solid var(--border-light)' : 'none' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{DAYS[d.getDay()]}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>{d.getDate()}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
           {/* List View rendering logic ... */}
        </div>
      )}
    </BusinessLayout>
  );
}