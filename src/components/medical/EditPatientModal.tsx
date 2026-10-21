import { useEffect, useId, useState, type FormEvent } from 'react';
import { Modal } from '../shared/Modal/Modal';
import { errorMessage } from '../shared/apiHelpers';
import { updatePatient } from './patientData';
import type { Patient } from '../../types';

/** Record keys written back to the patient (the same keys AddPatient registers and normalizePatient reads). */
type FieldKey = 'name' | 'phone' | 'email' | 'address' | 'primary_condition' | 'assigned_doctor' | 'status';

type Field = {
  key: FieldKey;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'select';
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  options?: Patient['status'][];
};

const FIELDS: Field[] = [
  { key: 'name', label: 'Full Name', required: true, autoComplete: 'off' },
  { key: 'phone', label: 'Phone', type: 'tel', autoComplete: 'off', placeholder: '(555) 000-0000' },
  { key: 'email', label: 'Email', type: 'email', autoComplete: 'off', placeholder: 'patient@example.com' },
  { key: 'address', label: 'Address', autoComplete: 'off', placeholder: 'Street, City, State ZIP' },
  { key: 'primary_condition', label: 'Primary Condition', placeholder: 'e.g. Hypertension' },
  { key: 'assigned_doctor', label: 'Assigned Doctor', placeholder: "Doctor's name" },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Pending', 'Discharged'] },
];

const PHONE_PATTERN = /^\+?[\d\s().-]{6,}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

const valuesFrom = (patient: Patient): Record<FieldKey, string> => ({
  name: patient.name,
  phone: patient.phone,
  email: patient.email,
  address: patient.address,
  primary_condition: patient.primaryCondition,
  assigned_doctor: patient.doctor,
  status: patient.status,
});

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after the patch was saved, so the page can reload the record */
  onSaved: () => void;
  patient: Patient;
  userId: string | number;
}

export function EditPatientModal({ isOpen, onClose, onSaved, patient, userId }: EditPatientModalProps) {
  const formId = useId();
  const [values, setValues] = useState<Record<FieldKey, string>>(() => valuesFrom(patient));
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  // Start each opening from the current record
  useEffect(() => {
    if (isOpen) {
      setValues(valuesFrom(patient));
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, patient]);

  const validate = () => {
    const next: Partial<Record<FieldKey, string>> = {};
    for (const field of FIELDS) {
      const value = values[field.key].trim();
      if (field.required && !value) next[field.key] = `${field.label} is required.`;
      else if (value && field.type === 'tel' && !PHONE_PATTERN.test(value)) next[field.key] = 'Enter a valid phone number.';
      else if (value && field.type === 'email' && !EMAIL_PATTERN.test(value)) next[field.key] = 'Enter a valid email address.';
    }
    setErrors(next);
    const firstInvalid = FIELDS.find(f => next[f.key]);
    if (firstInvalid) document.getElementById(`${formId}-${firstInvalid.key}`)?.focus();
    return !firstInvalid;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || !validate()) return;
    const patch = Object.fromEntries(FIELDS.map(f => [f.key, values[f.key].trim()]));
    setSaving(true);
    setSubmitError('');
    try {
      await updatePatient(userId, patient.id, patch);
      onSaved();
      onClose();
    } catch (err) {
      setSubmitError(errorMessage(err, 'Could not save the patient.'));
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <>
      <button type="button" className="btn-secondary btn-md" onClick={onClose} disabled={saving}>Cancel</button>
      <button type="submit" form={formId} className="btn-primary btn-md" disabled={saving}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title="Edit Patient" footer={footer}>
      <form id={formId} onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 14 }}>
        {FIELDS.map(field => {
          const id = `${formId}-${field.key}`;
          const error = errors[field.key];
          const common = {
            id,
            className: field.type === 'select' ? 'form-input form-select' : 'form-input',
            value: values[field.key],
            disabled: saving,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? `${id}-error` : undefined,
            onChange: (e: { target: { value: string } }) => {
              const value = e.target.value;
              setValues(v => ({ ...v, [field.key]: value }));
            },
          };
          return (
            <div key={field.key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor={id}>{field.label}{field.required ? ' *' : ''}</label>
              {field.type === 'select' ? (
                <select {...common}>
                  {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : (
                <input
                  {...common}
                  type={field.type ?? 'text'}
                  required={field.required}
                  autoComplete={field.autoComplete}
                  placeholder={field.placeholder}
                />
              )}
              {error && <p id={`${id}-error`} className="form-error">{error}</p>}
            </div>
          );
        })}
        {submitError && (
          <p role="alert" style={{ fontSize: 13, color: 'var(--danger)', background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 6 }}>
            {submitError}
          </p>
        )}
      </form>
    </Modal>
  );
}
