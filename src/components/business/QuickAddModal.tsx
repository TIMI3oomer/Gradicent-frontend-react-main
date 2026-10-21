import { useEffect, useId, useState, type FormEvent } from 'react';
import { Modal } from '../shared/Modal/Modal';
import { errorMessage } from '../shared/apiHelpers';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export type QuickAddField = {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
};

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called after the record was saved, so the page can reload its list */
  onCreated: () => void;
  title: string;
  /** Payload key the API expects, e.g. "employee" -> { employee: {...} } */
  entity: string;
  /** e.g. /api/binder/employees */
  endpoint: string;
  fields: QuickAddField[];
  submitLabel?: string;
}

const emptyValues = (fields: QuickAddField[]) =>
  Object.fromEntries(fields.map(f => [f.key, f.type === 'select' ? (f.options?.[0] ?? '') : ''])) as Record<string, string>;

/** Small create form for business records (employees, products, services). */
export function QuickAddModal({ isOpen, onClose, onCreated, title, entity, endpoint, fields, submitLabel = 'Save' }: QuickAddModalProps) {
  const { user } = useAuth();
  const formId = useId();
  const [values, setValues] = useState<Record<string, string>>(() => emptyValues(fields));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  // Start each opening with a clean form
  useEffect(() => {
    if (isOpen) {
      setValues(emptyValues(fields));
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, fields]);

  const validate = () => {
    const next: Record<string, string> = {};
    for (const field of fields) {
      const value = values[field.key]?.trim() ?? '';
      if (field.required && !value) next[field.key] = `${field.label} is required.`;
      else if (field.type === 'number' && value) {
        const n = Number(value);
        if (!Number.isFinite(n)) next[field.key] = `${field.label} must be a number.`;
        else if (field.min !== undefined && n < field.min) next[field.key] = `${field.label} can't be below ${field.min}.`;
      } else if (field.type === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) {
        next[field.key] = 'Enter a valid email address.';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user?.id || saving) return;
    if (!validate()) return;

    const record: Record<string, string | number> = {};
    for (const field of fields) {
      const value = values[field.key]?.trim() ?? '';
      if (!value) continue;
      record[field.key] = field.type === 'number' ? Number(value) : value;
    }

    setSaving(true);
    setSubmitError('');
    try {
      const query = api.getContextQuery('business', user.id);
      await api.createEntity(`${endpoint}${query}`, { domain: 'business', user_id: user.id, [entity]: record });
      onCreated();
      onClose();
    } catch (err) {
      setSubmitError(errorMessage(err, `Could not save the ${entity}.`));
    } finally {
      setSaving(false);
    }
  };

  const footer = (
    <>
      <button type="button" className="btn-secondary btn-md" onClick={onClose} disabled={saving}>Cancel</button>
      <button type="submit" form={formId} className="btn-primary btn-md" disabled={saving}>
        {saving ? 'Saving…' : submitLabel}
      </button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={saving ? () => {} : onClose} title={title} footer={footer}>
      <form id={formId} onSubmit={handleSubmit} noValidate style={{ display: 'grid', gap: 14 }}>
        {fields.map(field => {
          const id = `${formId}-${field.key}`;
          const error = errors[field.key];
          const common = {
            id,
            className: field.type === 'select' ? 'form-input form-select' : field.type === 'textarea' ? 'form-input form-textarea' : 'form-input',
            value: values[field.key] ?? '',
            disabled: saving,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? `${id}-error` : undefined,
            onChange: (e: { target: { value: string } }) => setValues(v => ({ ...v, [field.key]: e.target.value })),
          };
          return (
            <div key={field.key} className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor={id}>{field.label}{field.required ? ' *' : ''}</label>
              {field.type === 'select' ? (
                <select {...common}>
                  {field.options?.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea {...common} placeholder={field.placeholder} />
              ) : (
                <input
                  {...common}
                  type={field.type === 'number' ? 'number' : field.type ?? 'text'}
                  inputMode={field.type === 'number' ? 'decimal' : undefined}
                  min={field.min}
                  step={field.type === 'number' ? 'any' : undefined}
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
