import { useState, type KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard as Edit2, Calendar, FileText, Printer } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { Avatar } from '../../components/shared/Avatar';
import { Badge } from '../../components/shared/Badge';
import { mockPatients } from '../../data/patients';
import { mockAppointments } from '../../data/appointments';
import { formatDate, formatRelativeTime } from '../../lib/formatters';

const TABS = ['Overview', 'Visit History', 'Vitals', 'Notes & Documents', 'Insurance'] as const;

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Overview');
  const [noteDraft, setNoteDraft] = useState('');
  // No notes API exists yet, so notes are kept for this session only and labelled as such
  const [allLocalNotes, setLocalNotes] = useState<{ id: number; patientId: string | undefined; text: string; createdAt: string }[]>([]);
  const localNotes = allLocalNotes.filter(note => note.patientId === id);

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

  const handleSaveNote = () => {
    const text = noteDraft.trim();
    if (!text) return;
    setLocalNotes(notes => [{ id: Date.now(), patientId: id, text, createdAt: new Date().toISOString() }, ...notes]);
    setNoteDraft('');
  };

  const patient = mockPatients.find(p => p.id === id);

  if (!patient) {
    return (
      <MedicalLayout title="Patient Not Found">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p style={{ fontSize: 18, color: 'var(--text-muted)', marginBottom: 20 }}>Patient {id} not found.</p>
          <button className="btn-primary btn-md" onClick={() => navigate('/medical/patients')}>
            <ArrowLeft size={14} /> Back to Patients
          </button>
        </div>
      </MedicalLayout>
    );
  }

  const patientAppts = mockAppointments.filter(a => a.attendeeId === patient.id);

  return (
    <MedicalLayout
      title={patient.name}
      breadcrumb="Patients"
    >
      {/* Back button */}
      <button
        className="btn-ghost btn-sm"
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}
        onClick={() => navigate('/medical/patients')}
      >
        <ArrowLeft size={14} /> Back to Patients
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
              <h2 style={{ fontFamily: 'var(--font-lora)', fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{patient.name}</h2>
              <Badge status={patient.status} size="md" withDot={patient.status === 'Active'} />
            </div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 10 }}>{patient.id}</div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              {[
                { label: 'Age', value: `${patient.age} years` },
                { label: 'DOB', value: formatDate(patient.dob, 'medium') },
                { label: 'Gender', value: patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other' },
                { label: 'Total Visits', value: patient.totalVisits.toString() },
                { label: 'Doctor', value: patient.doctor },
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
              disabled
              title="Coming soon"
              aria-label="Edit patient (coming soon)"
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
                { label: 'Email', value: patient.email },
                { label: 'Phone', value: patient.phone },
                { label: 'Address', value: patient.address },
                { label: 'Insurance', value: patient.insuranceProvider },
                { label: 'Policy #', value: patient.policyNumber },
                { label: 'Last Visit', value: formatDate(patient.lastVisit, 'medium') },
                { label: 'Next Appointment', value: patient.nextAppointment ? formatDate(patient.nextAppointment, 'medium') : 'Not scheduled' },
              ].map(({ label, value }) => (
                <div key={label} className={label === 'Address' || label === 'Email' ? 'medical-span-2' : undefined}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Medical Summary</div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Primary Condition</div>
              <Badge variant="info">{patient.primaryCondition}</Badge>
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
                {patient.medications.map(m => (
                  <div key={m} style={{ fontSize: 13, color: 'var(--text)', padding: '4px 8px', background: 'var(--surface-alt)', borderRadius: 6 }}>{m}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Visit History' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 20 }}>Visit Timeline</div>
          <div className="timeline">
            {patientAppts.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>No visit history available.</div>
            ) : patientAppts.map(appt => (
              <div key={appt.id} className="timeline-item">
                <div className="timeline-dot" style={{ background: appt.colorCode }} />
                <div className="timeline-date">{formatDate(appt.date, 'medium')} at {appt.time}</div>
                <div className="timeline-title">{appt.appointmentType} · {appt.duration} min</div>
                <div className="timeline-body">{appt.notes || 'No notes recorded.'}</div>
                <div style={{ marginTop: 4 }}><Badge status={appt.status} size="sm" /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'Insurance' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-title" style={{ marginBottom: 20 }}>Insurance Information</div>
          <div className="medical-detail-grid">
            {[
              { label: 'Insurance Provider', value: patient.insuranceProvider },
              { label: 'Policy Number', value: patient.policyNumber },
              { label: 'Coverage Type', value: 'Comprehensive' },
              { label: 'Deductible Status', value: 'Met' },
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
              {patient.emergencyContact.name} ({patient.emergencyContact.relation}) — {patient.emergencyContact.phone}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Notes & Documents' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="card-title" style={{ marginBottom: 16 }}>Clinical Notes</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <label htmlFor="clinical-note" className="sr-only">Clinical note</label>
            <textarea
              id="clinical-note"
              className="form-input form-textarea"
              placeholder="Add a clinical note..."
              style={{ flex: 1 }}
              value={noteDraft}
              onChange={e => setNoteDraft(e.target.value)}
              aria-describedby="clinical-note-hint"
            />
          </div>
          <div id="clinical-note-hint" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Notes are saved locally for this session only and are not yet synced to the patient record.
          </div>
          <button
            type="button"
            className="btn-primary btn-md"
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={handleSaveNote}
            disabled={noteDraft.trim().length === 0}
          >
            <FileText size={14} aria-hidden="true" /> Save note locally
          </button>
          {localNotes.length > 0 && (
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }} aria-live="polite">
              {localNotes.map(note => (
                <div key={note.id} style={{ padding: '12px 16px', background: 'var(--surface-alt)', borderRadius: 8, border: '1px dashed var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                    Saved locally · {formatRelativeTime(note.createdAt)}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{note.text}</div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--surface-alt)', borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Most Recent Note</div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{patient.notes || 'No notes on file.'}</div>
          </div>
        </div>
      )}

      {(activeTab === 'Vitals') && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Vitals Overview</div>
          <div className="two-col">
            {[
              { label: 'Blood Pressure', value: '128/82 mmHg', status: 'warning' as const },
              { label: 'Heart Rate', value: '76 bpm', status: 'success' as const },
              { label: 'Weight', value: '72 kg', status: 'success' as const },
              { label: 'Temperature', value: '37.1°C', status: 'success' as const },
            ].map(v => (
              <div key={v.label} style={{ padding: '16px', background: 'var(--surface-alt)', borderRadius: 10, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{v.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{v.value}</div>
                <div style={{ marginTop: 8 }}><Badge variant={v.status} size="sm">{v.status === 'warning' ? 'Elevated' : 'Normal'}</Badge></div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
    </MedicalLayout>
  );
}
