import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck as CheckCircle2 } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';

const STEPS = ['Personal Information', 'Medical Information', 'Assignment & Scheduling'];

export function AddPatient() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: '', dob: '', gender: 'F', phone: '', email: '', address: '',
    emergencyName: '', emergencyPhone: '',
    condition: '', allergies: '', medications: '', history: '',
    insurance: '', policyNumber: '',
    doctor: '', appointmentDate: '', notes: '', consent: false,
  });

  const update = (k: keyof typeof form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate('/medical/patients'), 1800);
  };

  return (
    <MedicalLayout title="Add New Patient">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Progress */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 32 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: i <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i < step ? 'var(--accent)' : i === step ? 'var(--accent)' : 'var(--surface)',
                  border: `2px solid ${i <= step ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: i <= step ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {i < step ? <CheckCircle2 size={16} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />}
              </div>
              <div style={{ fontSize: 11, color: i === step ? 'var(--accent)' : 'var(--text-muted)', marginTop: 6, fontWeight: i === step ? 700 : 400, textAlign: 'center' }}>{s}</div>
            </div>
          ))}
        </div>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ textAlign: 'center', padding: '40px' }}
          >
            <CheckCircle2 size={48} style={{ color: '#4CAF7D', margin: '0 auto 16px' }} />
            <h3 style={{ fontFamily: 'var(--font-lora)', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Patient Added Successfully!</h3>
            <p style={{ color: 'var(--text-muted)' }}>Redirecting to patient list...</p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="card"
            >
              <h3 style={{ fontFamily: 'var(--font-lora)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 24 }}>
                Step {step + 1}: {STEPS[step]}
              </h3>

              {step === 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input id="name" className="form-input" placeholder="First Last" value={form.name} onChange={e => update('name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dob">Date of Birth *</label>
                    <input id="dob" className="form-input" type="date" value={form.dob} onChange={e => update('dob', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="gender">Gender *</label>
                    <select id="gender" className="form-input form-select" value={form.gender} onChange={e => update('gender', e.target.value)}>
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone *</label>
                    <input id="phone" className="form-input" placeholder="(555) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input id="email" className="form-input" type="email" placeholder="patient@email.com" value={form.email} onChange={e => update('email', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="address">Address</label>
                    <input id="address" className="form-input" placeholder="123 Main St, City, State ZIP" value={form.address} onChange={e => update('address', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergencyName">Emergency Contact Name</label>
                    <input id="emergencyName" className="form-input" value={form.emergencyName} onChange={e => update('emergencyName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergencyPhone">Emergency Contact Phone</label>
                    <input id="emergencyPhone" className="form-input" value={form.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="condition">Primary Condition *</label>
                    <input id="condition" className="form-input" placeholder="e.g. Hypertension" value={form.condition} onChange={e => update('condition', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="allergies">Allergies</label>
                    <input id="allergies" className="form-input" placeholder="e.g. Penicillin, Sulfa" value={form.allergies} onChange={e => update('allergies', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="insurance">Insurance Provider</label>
                    <input id="insurance" className="form-input" value={form.insurance} onChange={e => update('insurance', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="policyNumber">Policy Number</label>
                    <input id="policyNumber" className="form-input" value={form.policyNumber} onChange={e => update('policyNumber', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="medications">Current Medications</label>
                    <textarea id="medications" className="form-input form-textarea" placeholder="List medications..." value={form.medications} onChange={e => update('medications', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="history">Medical History</label>
                    <textarea id="history" className="form-input form-textarea" value={form.history} onChange={e => update('history', e.target.value)} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="doctor">Assign Doctor *</label>
                    <select id="doctor" className="form-input form-select" value={form.doctor} onChange={e => update('doctor', e.target.value)}>
                      <option value="">Select a doctor...</option>
                      {['Dr. Sarah Chen', 'Dr. James Park', 'Dr. Michael Torres', 'Dr. Amanda Ross', 'Dr. Kevin Lee'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="appointmentDate">First Appointment (Optional)</label>
                    <input id="appointmentDate" className="form-input" type="datetime-local" value={form.appointmentDate} onChange={e => update('appointmentDate', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" htmlFor="notes">Additional Notes</label>
                    <textarea id="notes" className="form-input form-textarea" value={form.notes} onChange={e => update('notes', e.target.value)} />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={e => update('consent', e.target.checked)}
                        style={{ width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>Patient has given informed consent to treatment and data storage. *</span>
                    </label>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 20, borderTop: '1px solid var(--border)', marginTop: 20 }}>
                <button
                  className="btn-ghost btn-md"
                  onClick={() => step === 0 ? navigate('/medical/patients') : setStep(s => s - 1)}
                >
                  {step === 0 ? 'Cancel' : '← Back'}
                </button>
                <button
                  className="btn-primary btn-md"
                  onClick={step < 2 ? () => setStep(s => s + 1) : handleSubmit}
                  disabled={step === 2 && !form.consent || loading}
                >
                  {loading ? <><span className="btn-spinner" />Saving...</> : step < 2 ? 'Next →' : 'Add Patient'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </MedicalLayout>
  );
}
