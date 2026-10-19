import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, ChevronLeft, CircleCheck as CheckCircle2, ShieldAlert, UserRoundPlus } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_ROUTES, MEDICAL_ROUTES } from '../../lib/constants';
import { fetchPlanStatus, submitClientRegistration, trackUsageTime } from '../../lib/api';
import { errorMessage } from '../../components/shared/apiHelpers';

type Domain = 'business' | 'medical';

type FieldSpec = {
  id: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
  required?: boolean;
  options?: string[];
  payloadKey: string;
};

const FIELD_MAP: Record<Domain, FieldSpec[]> = {
  business: [
    { id: 'PName', label: 'Client Name', placeholder: 'Acme Health', required: true, payloadKey: 'name' },
    { id: 'idnum', label: 'Client ID', placeholder: 'CLI-1042', payloadKey: 'id' },
    { id: 'PNum', label: 'Phone', placeholder: '(555) 234-5678', type: 'tel', required: true, payloadKey: 'phone' },
    { id: 'loc', label: 'Location', placeholder: 'Austin, TX', required: true, payloadKey: 'location' },
    { id: 'medh', label: 'Notes', placeholder: 'Key account notes, renewal context, and scope...', type: 'textarea', payloadKey: 'notes' },
    { id: 'allergies', label: 'Tags', placeholder: 'Enterprise, Priority, Referral', payloadKey: 'tags' },
    { id: 'btype', label: 'Account Status', placeholder: 'Select status', type: 'select', options: ['Lead', 'Active', 'Churned'], payloadKey: 'status' },
    { id: 'sex', label: 'Plan', placeholder: 'Select plan', type: 'select', options: ['Basic', 'Pro', 'Enterprise'], payloadKey: 'plan' },
    { id: 'age', label: 'Years Active', placeholder: '2', type: 'number', payloadKey: 'age' },
  ],
  medical: [
    { id: 'PName', label: 'Patient Name', placeholder: 'Jordan Smith', required: true, payloadKey: 'name' },
    { id: 'idnum', label: 'Patient ID', placeholder: 'PT-2041', payloadKey: 'id' },
    { id: 'PNum', label: 'Phone', placeholder: '(555) 234-5678', type: 'tel', required: true, payloadKey: 'phone' },
    { id: 'loc', label: 'Address', placeholder: '123 Main St, Boston, MA', required: true, payloadKey: 'address' },
    { id: 'medh', label: 'Medical History', placeholder: 'Relevant history, current concerns, and treatment notes...', type: 'textarea', payloadKey: 'medical_history' },
    { id: 'allergies', label: 'Allergies', placeholder: 'Penicillin, Sulfa', payloadKey: 'allergies' },
    { id: 'btype', label: 'Blood Type', placeholder: 'Select blood type', type: 'select', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], payloadKey: 'blood_type' },
    { id: 'sex', label: 'Gender', placeholder: 'Select gender', type: 'select', options: ['Female', 'Male', 'Other'], payloadKey: 'gender' },
    { id: 'age', label: 'Age', placeholder: '34', type: 'number', required: true, payloadKey: 'age' },
  ],
};

function detectDomain(pathname: string, search: string): Domain {
  const query = new URLSearchParams(search).get('domain');
  if (query === 'medical' || query === 'business') return query;
  if (pathname.startsWith('/medical')) return 'medical';
  return 'business';
}

function createInitialForm(fields: FieldSpec[]) {
  return fields.reduce<Record<string, string>>((acc, field) => {
    acc[field.id] = '';
    return acc;
  }, {});
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+\d\s().-]+$/;

/** Returns an inline error message for a field, or null when the value is acceptable. */
function validateField(field: FieldSpec, rawValue: string): string | null {
  const value = rawValue.trim();
  if (!value) return field.required ? `${field.label} is required.` : null;

  if (field.type === 'email' && !EMAIL_PATTERN.test(value)) {
    return 'Enter a valid email address, e.g. name@example.com.';
  }
  if (field.type === 'tel') {
    const digits = value.replace(/\D/g, '');
    if (!PHONE_PATTERN.test(value) || digits.length < 7 || digits.length > 15) {
      return 'Enter a valid phone number (7–15 digits).';
    }
  }
  if (field.type === 'number') {
    const n = Number(value);
    if (!Number.isFinite(n) || n < 0) return `${field.label} must be a positive number.`;
  }
  return null;
}

function collectPayload(fields: FieldSpec[], form: Record<string, string>) {
  return fields.reduce<Record<string, unknown>>((acc, field) => {
    const raw = form[field.id]?.trim() ?? '';
    if (!raw) return acc;

    if (field.type === 'number') {
      acc[field.payloadKey] = Number(raw);
      return acc;
    }

    if (field.payloadKey === 'tags' || field.payloadKey === 'allergies') {
      acc[field.payloadKey] = raw.split(',').map(item => item.trim()).filter(Boolean);
      return acc;
    }

    acc[field.payloadKey] = raw;
    return acc;
  }, {});
}

export function ClientRegistration({ domain: forcedDomain }: { domain?: Domain }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const domain = forcedDomain ?? detectDomain(location.pathname, location.search);
  const fields = useMemo(() => FIELD_MAP[domain], [domain]);
  const [form, setForm] = useState<Record<string, string>>(() => createInitialForm(fields));
  // The signed-in user is already known from the auth context; no need to re-fetch /api/auth/me
  const userId = user?.id ?? null;
  const [planStatus, setPlanStatus] = useState<string>(user?.plan?.toLowerCase() ?? 'basic');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  // Inline validation: show a field's error once it has been touched or a submit was attempted
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const isMedical = domain === 'medical';
  const Layout = isMedical ? MedicalLayout : BusinessLayout;
  const title = isMedical ? 'Register Patient' : 'Add Client';
  const subtitle = isMedical
    ? 'Add a new patient to your medical workspace.'
    : 'Add a new client to your business workspace.';
  const targetRoute = isMedical ? MEDICAL_ROUTES.PATIENTS : BUSINESS_ROUTES.CLIENTS;

  useEffect(() => {
    setForm(createInitialForm(fields));
    setTouched({});
    setSubmitAttempted(false);
  }, [fields]);

  useEffect(() => {
    let active = true;

    void fetchPlanStatus(domain, userId)
      .then(resolvedPlan => {
        if (active) setPlanStatus(resolvedPlan);
      })
      .catch(() => {
        if (active) setPlanStatus(user?.plan?.toLowerCase() ?? 'basic');
      });

    return () => {
      active = false;
    };
  }, [domain, userId, user?.plan]);

  // Usage tracking: report only the time elapsed since the previous report so nothing is
  // counted twice, and never let a tracking failure surface as an unhandled rejection.
  useEffect(() => {
    let lastReport = Date.now();
    const report = () => {
      const now = Date.now();
      const seconds = Math.round((now - lastReport) / 1000);
      lastReport = now;
      if (seconds > 0) trackUsageTime(seconds).catch(() => {});
    };

    const interval = window.setInterval(report, 60000);
    return () => {
      window.clearInterval(interval);
      report();
    };
  }, []);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      const error = validateField(field, form[field.id] ?? '');
      if (error) next[field.id] = error;
    }
    return next;
  }, [fields, form]);
  const isValid = Object.keys(errors).length === 0;

  async function handleSubmit(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    if (loading) return;
    if (!isValid) {
      setSubmitAttempted(true);
      // Move focus to the first field that needs attention
      const firstInvalid = fields.find(field => errors[field.id]);
      if (firstInvalid) document.getElementById(firstInvalid.id)?.focus();
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const legacyFields = collectPayload(fields, form);
      const response = await submitClientRegistration(
        {
          domain,
          plan_status: planStatus,
          user_id: userId ?? undefined,
          legacy_fields: legacyFields,
          client: legacyFields,
        },
        domain,
        userId ?? undefined,
      );

      const createdId = (response.data as { id?: string | number } | undefined)?.id;
      setStatus('success');
      setMessage(isMedical ? 'Patient record created successfully.' : 'Client record created successfully.');

      if (planStatus !== 'sec') {
        window.setTimeout(() => {
          navigate(createdId ? `${targetRoute}/${createdId}` : targetRoute, { replace: true });
        }, 800);
      }
    } catch (error) {
      setStatus('error');
      setMessage(errorMessage(error, 'Failed to save the record.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout title={title}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div className="card" style={{ marginBottom: 20, padding: 22, background: 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(34,197,94,0.08))' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--accent)', color: 'white', display: 'grid', placeItems: 'center', boxShadow: '0 14px 28px rgba(56,189,248,0.18)' }}>
                {isMedical ? <ShieldAlert size={20} /> : <Building2 size={20} />}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{title}</h2>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', maxWidth: 660 }}>{subtitle}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', textTransform: 'capitalize' }}>{domain} workspace</span>
              <span className="badge" style={{ background: 'var(--surface)', border: '1px solid var(--border)', textTransform: 'capitalize' }}>{planStatus} plan</span>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="card"
              style={{ textAlign: 'center', padding: '44px 28px' }}
            >
              <CheckCircle2 size={52} style={{ color: '#22c55e', margin: '0 auto 14px' }} />
              <h3 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>Saved</h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>{message}</p>
              {planStatus === 'sec' && (
                <p style={{ margin: '12px 0 0', color: 'var(--text-muted)', fontSize: 13 }}>
                  Navigation is restricted for this plan, so you will stay on this page.
                </p>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="card"
              style={{ padding: 24 }}
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="medical-form-grid medical-form-grid--three">
                {fields.map(field => {
                  const error = (touched[field.id] || submitAttempted) ? errors[field.id] : undefined;
                  const errorId = `${field.id}-error`;
                  const common = {
                    id: field.id,
                    value: form[field.id],
                    'aria-invalid': error ? true : undefined,
                    'aria-describedby': error ? errorId : undefined,
                    'aria-required': field.required || undefined,
                    onBlur: () => setTouched(prev => ({ ...prev, [field.id]: true })),
                  };
                  return (
                    <div key={field.id} className={`form-group${field.type === 'textarea' ? ' medical-span-2' : ''}`}>
                      <label className="form-label" htmlFor={field.id}>{field.label}{field.required ? ' *' : ''}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          {...common}
                          className="form-input form-textarea"
                          placeholder={field.placeholder}
                          onChange={e => setForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                        />
                      ) : field.type === 'select' ? (
                        <select
                          {...common}
                          className="form-input form-select"
                          onChange={e => setForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                        >
                          <option value="">{field.placeholder}</option>
                          {field.options?.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          {...common}
                          className="form-input"
                          type={field.type ?? 'text'}
                          inputMode={field.type === 'tel' ? 'tel' : field.type === 'number' ? 'numeric' : undefined}
                          placeholder={field.placeholder}
                          onChange={e => setForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                        />
                      )}
                      {error && <div id={errorId} className="form-error">{error}</div>}
                    </div>
                  );
                })}
              </div>

              {status === 'error' && (
                <div role="alert" style={{ marginTop: 16, padding: '12px 14px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', color: 'var(--text)' }}>
                  {message}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                <button className="btn-ghost btn-md" onClick={() => navigate(targetRoute)} type="button" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <ChevronLeft size={16} aria-hidden="true" /> Back
                </button>

                <button
                  className="btn-primary btn-md"
                  disabled={loading}
                  type="submit"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {loading ? <span className="btn-spinner" aria-hidden="true" /> : <UserRoundPlus size={16} aria-hidden="true" />}
                  {loading ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}