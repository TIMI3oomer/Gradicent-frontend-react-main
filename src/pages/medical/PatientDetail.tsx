import { useEffect, useState, type KeyboardEvent } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard as Edit2, Calendar, FileText, Printer, HeartPulse } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { Avatar } from '../../components/shared/Avatar';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { ErrorBanner, LoadingState, UnavailableNotice } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, isMissingEndpoint } from '../../components/shared/apiHelpers';
import { MEDICAL_DOMAIN, fetchPatient, toVisits, updatePatient, type VisitRecord } from '../../components/medical/patientData';
import { EditPatientModal } from '../../components/medical/EditPatientModal';
import { DocumentsPanel } from '../../components/shared/Documents/DocumentsPanel';
import type { SaveStatus } from '../../components/shared/userProfile';
import { formatDate, formatRelativeTime } from '../../lib/formatters';
import { MEDICAL_ROUTES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import type { Patient } from '../../types';

const TABS = ['Overview', 'Visit History', 'Vitals', 'Notes & Documents', 'Insurance'] as const;
type Tab = typeof TABS[number];
/** `?tab=<slug>` opens a section directly, e.g. /medical/patients/123?tab=notes */
const TAB_SLUGS: Record<Tab, string> = {
  Overview: 'overview',
  'Visit History': 'visits',
  Vitals: 'vitals',
  'Notes & Documents': 'notes',
  Insurance: 'insurance',
};
const tabFromSlug = (slug: string | null): Tab => TABS.find(t => TAB_SLUGS[t] === slug) ?? 'Overview';
const GENDER_LABELS: Record<string, string> = { M: 'Male', F: 'Female', Other: 'Other' };

type VisitState = { rows: VisitRecord[]; error: string | null; unavailable: boolean };
const emptyVisits: VisitState = { rows: [], error: null, unavailable: false };

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visits, setVisits] = useState<VisitState>(emptyVisits);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTabState] = useState<Tab>(() => tabFromSlug(searchParams.get('tab')));
  // Arriving from a patient card's "Add note" button puts the cursor straight in the note box
  const [focusNoteOnOpen] = useState(() => searchParams.get('tab') === TAB_SLUGS['Notes & Documents']);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteStatus, setNoteStatus] = useState<SaveStatus>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Keep the open section in the URL so a reload or shared link lands on the same tab
  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (tab === 'Overview') next.delete('tab');
      else next.set('tab', TAB_SLUGS[tab]);
      return next;
    }, { replace: true });
  };

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = TABS.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(TABS[next]);
    document.getElementById(`patient-tab-${next}`)?.focus();
  };

  useEffect(() => {
    if (!id) return;
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    let ignore = false;

    const loadPatient = async () => {
      setIsLoading(true);
      setError(null);
      setNoteStatus(null);
      const query = api.getContextQuery(MEDICAL_DOMAIN, userId);
      // The record and its visit history load independently so a missing history route doesn't break the page
      const [patientRes, visitsRes] = await Promise.allSettled([
        fetchPatient(userId, id),
        api.fetchList<unknown>(`/api/binder/clients/${encodeURIComponent(id)}/appointments`, query),
      ]);
      if (ignore) return;

      if (patientRes.status === 'fulfilled') {
        setPatient(patientRes.value);
      } else {
        console.error('[PatientDetail] Fetch error:', patientRes.reason);
        setPatient(null);
        setError(errorMessage(patientRes.reason, 'Could not load this patient.'));
      }

      if (visitsRes.status === 'fulfilled') setVisits({ rows: toVisits(visitsRes.value), error: null, unavailable: false });
      else if (isMissingEndpoint(visitsRes.reason)) setVisits({ rows: [], error: null, unavailable: true });
      else setVisits({ rows: [], error: errorMessage(visitsRes.reason, 'Could not load visit history.'), unavailable: false });

      setIsLoading(false);
    };

    loadPatient();
    return () => { ignore = true; };
  }, [id, user?.id, authLoading, reloadKey]);

  const retry = user?.id ? () => setReloadKey(k => k + 1) : undefined;

  // Notes live on the patient record as `notes_log`; the new one is appended to what is already there
  const handleSaveNote = async () => {
    const text = noteDraft.trim();
    if (!text || !id || !user?.id || !patient || noteStatus?.type === 'saving') return;
    const nextLog = [...patient.notesLog, { text, createdAt: new Date().toISOString() }];
    setNoteStatus({ type: 'saving' });
    try {
      await updatePatient(user.id, id, { notes_log: nextLog });
      setPatient(prev => (prev ? { ...prev, notesLog: nextLog } : prev));
      setNoteDraft('');
      setNoteStatus({ type: 'saved' });
    } catch (err) {
      setNoteStatus({ type: 'error', message: errorMessage(err, 'Could not save the note.') });
    }
  };

  // Refresh the record after an edit without swapping the whole page for a spinner
  const handlePatientSaved = async () => {
    if (!id || !user?.id) return;
    try {
      const fresh = await fetchPatient(user.id, id);
      if (fresh) setPatient(fresh);
      else setReloadKey(k => k + 1);
    } catch {
      setReloadKey(k => k + 1);
    }
  };

  if (isLoading) {
    return (
      <MedicalLayout title="Patient" breadcrumb="Patients">
        <LoadingState label="Loading patient..." padding="100px 0" />
      </MedicalLayout>
    );
  }

  if (error || !patient) {
    return (
      <MedicalLayout title={error ? 'Patient' : 'Patient Not Found'} breadcrumb="Patients">
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
          {error ? <ErrorBanner message={error} onRetry={retry} /> : (
            <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 20 }}>Patient {id} not found.</p>
          )}
          <button className="btn-primary btn-md" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }} onClick={() => navigate(MEDICAL_ROUTES.PATIENTS)}>
            <ArrowLeft size={14} aria-hidden="true" /> Back to Patients
          </button>
        </div>
      </MedicalLayout>
    );
  }

  const totalVisits = patient.totalVisits ?? (visits.error || visits.unavailable ? null : visits.rows.length);
  const contact = patient.emergencyContact;
  const contactLine = [
    [contact.name, contact.relation ? `(${contact.relation})` : ''].filter(Boolean).join(' '),
    contact.phone,
  ].filter(Boolean).join(' — ');

  return (
    <MedicalLayout
      title={patient.name || 'Patient'}
      breadcrumb="Patients"
    >
      {/* Back button */}
      <button
        className="btn-ghost btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}
        onClick={() => navigate(MEDICAL_ROUTES.PATIENTS)}
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to Patients
      </button>

      {/* Hero card */}
      <motion.div
        className="card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 20 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <Avatar name={patient.name} size="xl" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 26, fontWeight: 700, color: 'var(--text)', overflowWrap: 'anywhere' }}>{patient.name || '—'}</h2>
              <Badge status={patient.status} size="md" withDot={patient.status === 'Active'} />
            </div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 10 }}>{patient.id}</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Age', value: patient.age === null ? '—' : `${patient.age} years` },
                { label: 'DOB', value: formatDate(patient.dob, 'medium') },
                { label: 'Gender', value: GENDER_LABELS[patient.gender] ?? '—' },
                { label: 'Total Visits', value: totalVisits === null ? '—' : String(totalVisits) },
                { label: 'Doctor', value: patient.doctor || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--surface-alt)', padding: '6px 12px', borderRadius: 8, fontSize: 12 }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 1 }}>{label}</div>
                  <div style={{ fontWeight: 700, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="medical-hero-actions">
            <button
              type="button"
              className="btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              onClick={() => setEditOpen(true)}
              aria-haspopup="dialog"
            >
              <Edit2 size={13} aria-hidden="true" /> Edit
            </button>
            <button type="button" className="btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              onClick={() => navigate('/medical/appointments')}>
              <Calendar size={13} aria-hidden="true" /> Schedule
            </button>
            <button type="button" className="btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 5 }}
              onClick={() => window.print()}>
              <Printer size={13} aria-hidden="true" /> Print
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="medical-tabs" role="tablist" aria-label="Patient record sections">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`patient-tab-${i}`}
            aria-selected={activeTab === tab}
            aria-controls="patient-tabpanel"
            tabIndex={activeTab === tab ? 0 : -1}
            onClick={() => setActiveTab(tab)}
            onKeyDown={e => onTabKeyDown(e, i)}
            style={{
              padding: '10px 16px',
              fontSize: 13,
              fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.15s',
              fontFamily: 'var(--font-dm-sans)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div role="tabpanel" id="patient-tabpanel" aria-labelledby={`patient-tab-${TABS.indexOf(activeTab)}`}>
      {activeTab === 'Overview' && (
        <div className="two-col">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Patient Information</div>
            <div className="medical-detail-grid">
              {[
                { label: 'Email', value: patient.email || '—' },
                { label: 'Phone', value: patient.phone || '—' },
                { label: 'Address', value: patient.address || '—' },
                { label: 'Insurance', value: patient.insuranceProvider || '—' },
                { label: 'Policy #', value: patient.policyNumber || '—' },
                { label: 'Registered', value: formatDate(patient.createdAt, 'medium') },
                { label: 'Last Visit', value: formatDate(patient.lastVisit, 'medium') },
                { label: 'Next Appointment', value: patient.nextAppointment ? formatDate(patient.nextAppointment, 'medium') : 'Not scheduled' },
              ].map(({ label, value }) => (
                <div key={label} className={label === 'Address' || label === 'Email' ? 'medical-span-2' : undefined}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)', overflowWrap: 'anywhere' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Medical Summary</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Primary Condition</div>
              {patient.primaryCondition ? <Badge variant="info">{patient.primaryCondition}</Badge> : <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>—</span>}
            </div>
            {patient.secondaryConditions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Secondary Conditions</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {patient.secondaryConditions.map(c => <Badge key={c} variant="default">{c}</Badge>)}
                </div>
              </div>
            )}
            {patient.allergies.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Allergies</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {patient.allergies.map(a => <Badge key={a} variant="error">{a}</Badge>)}
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Current Medications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {patient.medications.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>None recorded</div>
                ) : patient.medications.map(m => (
                  <div key={m} style={{ fontSize: 13, color: 'var(--text)', padding: '4px 8px', background: 'var(--surface-alt)', borderRadius: 6 }}>{m}</div>
                ))}
              </div>
            </div>
            {patient.medicalHistory && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Medical History</div>
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{patient.medicalHistory}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'Visit History' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Visit Timeline</div>
          {visits.error ? <ErrorBanner message={visits.error} onRetry={retry} /> : visits.unavailable ? (
            <UnavailableNotice icon={<Calendar size={28} />} title="Visit history isn't available yet">
              Booked appointments can still be managed on the Appointments page.
            </UnavailableNotice>
          ) : (
            <div className="timeline">
              {visits.rows.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No visit history available.</div>
              ) : visits.rows.map(visit => (
                <div key={visit.id} className="timeline-item">
                  <div className="timeline-dot" style={{ background: 'var(--accent)' }} />
                  <div className="timeline-date">{formatDate(visit.date, 'medium')}{visit.time ? ` at ${visit.time}` : ''}</div>
                  <div className="timeline-title">{visit.type}{visit.duration ? ` · ${visit.duration} min` : ''}</div>
                  <div className="timeline-body">{visit.notes || 'No notes recorded.'}</div>
                  {visit.status && <div style={{ marginTop: 4 }}><Badge status={visit.status as BadgeVariant} size="sm" /></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'Insurance' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-title" style={{ marginBottom: 20 }}>Insurance Information</div>
          <div className="medical-detail-grid">
            {[
              { label: 'Insurance Provider', value: patient.insuranceProvider || '—' },
              { label: 'Policy Number', value: patient.policyNumber || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--surface-alt)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Emergency Contact</div>
            <div style={{ fontSize: 14, color: 'var(--text)' }}>
              {contactLine || '—'}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Notes & Documents' && (
        <div className="two-col">
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Clinical Notes</div>
          <form
            onSubmit={e => { e.preventDefault(); handleSaveNote(); }}
            aria-busy={noteStatus?.type === 'saving' || undefined}
          >
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <label htmlFor="clinical-note" className="sr-only">Clinical note</label>
              <textarea
                id="clinical-note"
                className="form-input form-textarea"
                placeholder="Add a clinical note..."
                style={{ flex: 1 }}
                value={noteDraft}
                autoFocus={focusNoteOnOpen}
                readOnly={noteStatus?.type === 'saving'}
                onChange={e => {
                  setNoteDraft(e.target.value);
                  if (noteStatus?.type !== 'saving') setNoteStatus(null);
                }}
                aria-describedby="clinical-note-status"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <button
                type="submit"
                className="btn-primary btn-md"
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                disabled={noteDraft.trim().length === 0 || noteStatus?.type === 'saving'}
              >
                <FileText size={14} aria-hidden="true" /> {noteStatus?.type === 'saving' ? 'Saving…' : 'Save note'}
              </button>
              <span id="clinical-note-status" role="status" aria-live="polite" style={{ fontSize: 13 }}>
                {noteStatus?.type === 'saved' && <span style={{ color: 'var(--success)' }}>Note saved to the patient record.</span>}
                {noteStatus?.type === 'error' && <span style={{ color: 'var(--danger)' }}>{noteStatus.message}</span>}
              </span>
            </div>
          </form>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {patient.notesLog.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No clinical notes yet.</div>
            ) : [...patient.notesLog].reverse().map((note, i) => (
              <div key={`${note.createdAt}-${i}`} style={{ padding: '12px 16px', background: 'var(--surface-alt)', borderRadius: 8 }}>
                {note.createdAt && (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    <time dateTime={note.createdAt} title={formatDate(note.createdAt, 'medium')}>{formatRelativeTime(note.createdAt)}</time>
                  </div>
                )}
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{note.text}</div>
              </div>
            ))}
          </div>
          {patient.notes && (
            <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--surface-alt)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Registration Note</div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{patient.notes}</div>
            </div>
          )}
        </div>
        <div className="card">
          <DocumentsPanel domain="medical" clientId={patient.id} subject="patient" />
        </div>
        </div>
      )}

      {activeTab === 'Vitals' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Vitals Overview</div>
          <UnavailableNotice icon={<HeartPulse size={28} />} title="No vitals recorded">
            Vitals aren't stored in the patient record yet. They will appear here once recorded.
          </UnavailableNotice>
        </div>
      )}
      </div>

      {user?.id && (
        <EditPatientModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          onSaved={handlePatientSaved}
          patient={patient}
          userId={user.id}
        />
      )}
    </MedicalLayout>
  );
}
