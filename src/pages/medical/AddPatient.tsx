import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleCheck as CheckCircle2 } from 'lucide-react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { MEDICAL_ROUTES } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { fetchPlanStatus, submitClientRegistration } from '../../lib/api';
import { parseDate, toLocalIsoDate } from '../../lib/formatters';

const STEPS = ['Personal Information', 'Medical Information', 'Assignment & Scheduling'];

type PatientForm = {
  name: string; dob: string; gender: string; phone: string; email: string; address: string;
  emergencyName: string; emergencyPhone: string;
  condition: string; allergies: string; medications: string; history: string;
  insurance: string; policyNumber: string;
  doctor: string; appointmentDate: string; notes: string; consent: boolean;
};
type FieldKey = keyof PatientForm;
type Errors = Partial<Record<FieldKey, string>>;

const GENDER_LABELS: Record<string, string> = { F: 'Female', M: 'Male', Other: 'Other' };

// Fields validated on each step, in on-screen order (used to focus the first error)
const STEP_FIELDS: FieldKey[][] = [
  ['name', 'dob', 'gender', 'phone', 'email', 'emergencyPhone'],
  ['condition'],
  ['doctor', 'appointmentDate', 'consent'],
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidPhone(value: string) {
  const digits = value.replace(/\D/g, '');
  return /^[+()\d\s.-]+$/.test(value) && digits.length >= 7 && digits.length <= 15;
}

function ageFromDob(dob: string): number | null {
  const birth = parseDate(dob);
  if (!birth) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function validateField(key: FieldKey, form: PatientForm): string | undefined {
  const value = form[key];
  const text = typeof value === 'string' ? value.trim() : '';
  const today = toLocalIsoDate();

  switch (key) {
    case 'name':
      if (!text) return 'Full name is required.';
      if (text.length < 2) return 'Enter the patient\'s full name.';
      return undefined;
    case 'dob':
      if (!text) return 'Date of birth is required.';
      if (!parseDate(text)) return 'Enter a valid date.';
      if (text > today) return 'Date of birth can\'t be in the future.';
      if (text < '1900-01-01') return 'Enter a date after 1900.';
      return undefined;
    case 'gender':
      return text ? undefined : 'Select a gender.';
    case 'phone':
      if (!text) return 'Phone number is required.';
      return isValidPhone(text) ? undefined : 'Enter a valid phone number (7–15 digits).';
    case 'email':
      return !text || EMAIL_RE.test(text) ? undefined : 'Enter a valid email address.';
    case 'emergencyPhone':
      return !text || isValidPhone(text) ? undefined : 'Enter a valid phone number (7–15 digits).';
    case 'condition':
      return text ? undefined : 'Primary condition is required.';
    case 'doctor':
      return text ? undefined : 'Assign a doctor.';
    case 'appointmentDate': {
      if (!text) return undefined;
      const when = new Date(text);
      if (Number.isNaN(when.getTime())) return 'Enter a valid date and time.';
      return when.getTime() < Date.now() ? 'The first appointment can\'t be in the past.' : undefined;
    }
    case 'consent':
      return form.consent ? undefined : 'Patient consent is required to register.';
    default:
      return undefined;
  }
}

function validateStep(step: number, form: PatientForm): Errors {
  return STEP_FIELDS[step].reduce<Errors>((acc, key) => {
    const message = validateField(key, form);
    if (message) acc[key] = message;
    return acc;
  }, {});
}

function buildPayloadFields(form: PatientForm) {
  const fields: Record<string, unknown> = {
    name: form.name.trim(),
    phone: form.phone.trim(),
    gender: GENDER_LABELS[form.gender] ?? form.gender,
    dob: form.dob,
    age: ageFromDob(form.dob) ?? undefined,
    email: form.email.trim(),
    address: form.address.trim(),
    emergency_contact_name: form.emergencyName.trim(),
    emergency_contact_phone: form.emergencyPhone.trim(),
    primary_condition: form.condition.trim(),
    allergies: form.allergies.split(',').map(item => item.trim()).filter(Boolean),
    medications: form.medications.trim(),
    medical_history: form.history.trim(),
    insurance_provider: form.insurance.trim(),
    policy_number: form.policyNumber.trim(),
    assigned_doctor: form.doctor,
    first_appointment: form.appointmentDate,
    notes: form.notes.trim(),
    consent: form.consent,
  };

  // Mirror ClientRegistration: omit empty values
  return Object.fromEntries(
    Object.entries(fields).filter(([, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)),
  );
}

export function AddPatient() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState<PatientForm>({
    name: '', dob: '', gender: 'F', phone: '', email: '', address: '',
    emergencyName: '', emergencyPhone: '',
    condition: '', allergies: '', medications: '', history: '',
    insurance: '', policyNumber: '',
    doctor: '', appointmentDate: '', notes: '', consent: false,
  });

  const today = toLocalIsoDate();

  const update = (k: FieldKey, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    // Clear a field's error as soon as the user edits it
    if (errors[k]) setErrors(e => ({ ...e, [k]: undefined }));
  };

  const errorProps = (k: FieldKey) => ({
    'aria-invalid': errors[k] ? true : undefined,
    'aria-describedby': errors[k] ? `${k}-error` : undefined,
  });

  const fieldError = (k: FieldKey) =>
    errors[k] ? <div id={`${k}-error`} className="form-error" role="alert">{errors[k]}</div> : null;

  const checkStep = () => {
    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);
    const firstInvalid = STEP_FIELDS[step].find(key => stepErrors[key]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (checkStep()) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (loading) return;
    setSubmitError('');

    // Re-check every step in case earlier answers changed
    for (let i = 0; i < STEPS.length; i += 1) {
      const stepErrors = validateStep(i, form);
      if (Object.keys(stepErrors).length > 0) {
        setStep(i);
        setErrors(stepErrors);
        return;
      }
    }

    if (!user?.id) {
      setSubmitError('Your session has expired. Please sign in again to add a patient.');
      return;
    }

    setLoading(true);
    try {
      const planStatus = await fetchPlanStatus('medical', user.id);
      const legacyFields = buildPayloadFields(form);
      await submitClientRegistration(
        {
          domain: 'medical',
          plan_status: planStatus,
          user_id: user.id,
          legacy_fields: legacyFields,
          client: legacyFields,
        },
        'medical',
        user.id,
      );
      setDone(true);
      window.setTimeout(() => navigate(MEDICAL_ROUTES.PATIENTS), 1800);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setSubmitError(message || 'Failed to save the patient. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MedicalLayout title="Add New Patient">
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Progress */}
        <ol style={{ display: 'flex', gap: 0, marginBottom: 32, listStyle: 'none' }} aria-label="Registration progress">
          {STEPS.map((s, i) => (
            <li
              key={s}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              aria-current={i === step ? 'step' : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                {i > 0 && <div style={{ flex: 1, height: 2, background: i <= step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: i <= step ? 'var(--accent)' : 'var(--surface)',
                  border: `2px solid ${i <= step ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: i <= step ? 'white' : 'var(--text-muted)',
                  transition: 'all 0.3s',
                }}>
                  {i < step || done ? <CheckCircle2 size={16} aria-hidden="true" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? 'var(--accent)' : 'var(--border)', transition: 'background 0.3s' }} />}
              </div>
              <div style={{ fontSize: 11, color: i === step ? 'var(--accent)' : 'var(--text-muted)', marginTop: 6, fontWeight: i === step ? 700 : 400, textAlign: 'center' }}>{s}</div>
            </li>
          ))}
        </ol>

        {done ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card"
            style={{ textAlign: 'center', padding: '40px' }}
            role="status"
          >
            <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} aria-hidden="true" />
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
              <h3 style={{ fontFamily: 'var(--font-lora)', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
                Step {step + 1}: {STEPS[step]}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>Fields marked * are required.</p>

              {step === 0 && (
                <div className="medical-form-grid">
                  <div className="form-group medical-span-2">
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input id="name" className="form-input" placeholder="First Last" autoComplete="off" required value={form.name} onChange={e => update('name', e.target.value)} {...errorProps('name')} />
                    {fieldError('name')}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="dob">Date of Birth *</label>
                    <input id="dob" className="form-input" type="date" required min="1900-01-01" max={today} value={form.dob} onChange={e => update('dob', e.target.value)} {...errorProps('dob')} />
                    {fieldError('dob')}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="gender">Gender *</label>
                    <select id="gender" className="form-input form-select" required value={form.gender} onChange={e => update('gender', e.target.value)} {...errorProps('gender')}>
                      <option value="F">Female</option>
                      <option value="M">Male</option>
                      <option value="Other">Other</option>
                    </select>
                    {fieldError('gender')}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">Phone *</label>
                    <input id="phone" className="form-input" type="tel" required placeholder="(555) 000-0000" value={form.phone} onChange={e => update('phone', e.target.value)} {...errorProps('phone')} />
                    {fieldError('phone')}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">Email</label>
                    <input id="email" className="form-input" type="email" placeholder="patient@email.com" value={form.email} onChange={e => update('email', e.target.value)} {...errorProps('email')} />
                    {fieldError('email')}
                  </div>
                  <div className="form-group medical-span-2">
                    <label className="form-label" htmlFor="address">Address</label>
                    <input id="address" className="form-input" placeholder="123 Main St, City, State ZIP" value={form.address} onChange={e => update('address', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergencyName">Emergency Contact Name</label>
                    <input id="emergencyName" className="form-input" value={form.emergencyName} onChange={e => update('emergencyName', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergencyPhone">Emergency Contact Phone</label>
                    <input id="emergencyPhone" className="form-input" type="tel" value={form.emergencyPhone} onChange={e => update('emergencyPhone', e.target.value)} {...errorProps('emergencyPhone')} />
                    {fieldError('emergencyPhone')}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="medical-form-grid">
                  <div className="form-group medical-span-2">
                    <label className="form-label" htmlFor="condition">Primary Condition *</label>
                    <input id="condition" className="form-input" required placeholder="e.g. Hypertension" value={form.condition} onChange={e => update('condition', e.target.value)} {...errorProps('condition')} />
                    {fieldError('condition')}
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
                  <div className="form-group medical-span-2">
                    <label className="form-label" htmlFor="medications">Current Medications</label>
                    <textarea id="medications" className="form-input form-textarea" placeholder="List medications..." value={form.medications} onChange={e => update('medications', e.target.value)} />
                  </div>
                  <div className="form-group medical-span-2">
                    <label className="form-label" htmlFor="history">Medical History</label>
                    <textarea id="history" className="form-input form-textarea" value={form.history} onChange={e => update('history', e.target.value)} />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="medical-form-grid">
                  <div className="form-group medical-span-2">
                    <label className="form-label" htmlFor="doctor">Assign Doctor *</label>
                    <select id="doctor" className="form-input form-select" required value={form.doctor} onChange={e => update('doctor', e.target.value)} {...errorProps('doctor')}>
                      <option value="">Select a doctor...</option>
                      {['Dr. Sarah Chen', 'Dr. James Park', 'Dr. Michael Torres', 'Dr. Amanda Ross', 'Dr. Kevin Lee'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {fieldError('doctor')}
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="appointmentDate">First Appointment (Optional)</label>
                    <input id="appointmentDate" className="form-input" type="datetime-local" min={`${today}T00:00`} value={form.appointmentDate} onChange={e => update('appointmentDate', e.target.value)} {...errorProps('appointmentDate')} />
                    {fieldError('appointmentDate')}
                  </div>
                  <div className="form-group medical-span-2">
                    <label className="form-label" htmlFor="notes">Additional Notes</label>
                    <textarea id="notes" className="form-input form-textarea" value={form.notes} onChange={e => update('notes', e.target.value)} />
                  </div>
                  <div className="form-group medical-span-2">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        id="consent"
                        type="checkbox"
                        checked={form.consent}
                        onChange={e => update('consent', e.target.checked)}
                        style={{ width: 16, height: 16 }}
                        {...errorProps('consent')}
                      />
                      <span style={{ fontSize: 13, color: 'var(--text)' }}>Patient has given informed consent to treatment and data storage. *</span>
                    </label>
                    {fieldError('consent')}
                  </div>
                </div>
              )}

              {submitError && (
                <div className="medical-form-alert" role="alert">
                  <strong>Couldn&apos;t save the patient.</strong> {submitError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, paddingTop: 20, borderTop: '1px solid var(--border)', marginTop: 20 }}>
                <button
                  type="button"
                  className="btn-ghost btn-md"
                  onClick={() => { setErrors({}); if (step === 0) navigate(MEDICAL_ROUTES.PATIENTS); else setStep(s => s - 1); }}
                  disabled={loading}
                >
                  {step === 0 ? 'Cancel' : '← Back'}
                </button>
                <button
                  type="button"
                  className="btn-primary btn-md"
                  onClick={step < STEPS.length - 1 ? handleNext : () => void handleSubmit()}
                  disabled={loading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {loading ? <><span className="btn-spinner" />Saving...</> : step < STEPS.length - 1 ? 'Next →' : 'Add Patient'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </MedicalLayout>
  );
}
