import { useId, useState, type FormEvent } from 'react';
import { errorMessage } from './apiHelpers';
import type { SaveStatus } from './userProfile';

export type SettingsField = {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  /** Shown but never edited or submitted (e.g. the Google account email) */
  readOnly?: boolean;
  hint?: string;
  /** Extra class on the field wrapper, e.g. a two-column span */
  className?: string;
};

interface SettingsFormProps {
  fields: SettingsField[];
  initialValues: Record<string, string>;
  /** Receives the trimmed, editable values; throw to show an error */
  onSave: (values: Record<string, string>) => Promise<void>;
  gridClassName: string;
  disabled?: boolean;
  submitLabel?: string;
  savedMessage?: string;
}

const PHONE_PATTERN = /^\+?[\d\s().-]{6,}$/;
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

/** Validated settings form with saving / saved / error states. Remount it (key) to load new initial values. */
export function SettingsForm({
  fields, initialValues, onSave, gridClassName, disabled = false,
  submitLabel = 'Save Changes', savedMessage = 'Changes saved.',
}: SettingsFormProps) {
  const formId = useId();
  const [values, setValues] = useState<Record<string, string>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SaveStatus>(null);
  const saving = status?.type === 'saving';
  const editable = fields.filter(f => !f.readOnly);

  const validate = () => {
    const next: Record<string, string> = {};
    for (const field of editable) {
      const value = values[field.key]?.trim() ?? '';
      if (field.required && !value) next[field.key] = `${field.label} is required.`;
      else if (value && field.type === 'tel' && !PHONE_PATTERN.test(value)) next[field.key] = 'Enter a valid phone number.';
      else if (value && field.type === 'email' && !EMAIL_PATTERN.test(value)) next[field.key] = 'Enter a valid email address.';
    }
    setErrors(next);
    const firstInvalid = editable.find(f => next[f.key]);
    if (firstInvalid) document.getElementById(`${formId}-${firstInvalid.key}`)?.focus();
    return !firstInvalid;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (saving || disabled || !validate()) return;
    const payload: Record<string, string> = {};
    for (const field of editable) payload[field.key] = values[field.key]?.trim() ?? '';
    setStatus({ type: 'saving' });
    try {
      await onSave(payload);
      setValues(v => ({ ...v, ...payload }));
      setStatus({ type: 'saved' });
    } catch (err) {
      setStatus({ type: 'error', message: errorMessage(err, 'Could not save your changes.') });
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <fieldset disabled={disabled} style={{ border: 'none', padding: 0, margin: 0, minWidth: 0 }}>
        <div className={gridClassName}>
          {fields.map(field => {
            const id = `${formId}-${field.key}`;
            const error = errors[field.key];
            const describedBy = [error ? `${id}-error` : '', field.hint ? `${id}-hint` : ''].filter(Boolean).join(' ') || undefined;
            return (
              <div key={field.key} className={['form-group', field.className].filter(Boolean).join(' ')} style={{ minWidth: 0 }}>
                <label className="form-label" htmlFor={id}>{field.label}{field.required ? ' *' : ''}</label>
                <input
                  id={id}
                  className="form-input"
                  type={field.type ?? 'text'}
                  value={values[field.key] ?? ''}
                  placeholder={field.placeholder}
                  autoComplete={field.autoComplete}
                  readOnly={field.readOnly || saving}
                  required={field.required}
                  aria-required={field.required || undefined}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  onChange={e => {
                    const value = e.target.value;
                    setValues(v => ({ ...v, [field.key]: value }));
                    if (errors[field.key]) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next[field.key];
                        return next;
                      });
                    }
                    if (status?.type !== 'saving') setStatus(null);
                  }}
                />
                {field.hint && <p id={`${id}-hint`} style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{field.hint}</p>}
                {error && <p id={`${id}-error`} className="form-error">{error}</p>}
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          <button type="submit" className="btn-primary btn-md" disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </button>
          <span role="status" aria-live="polite" style={{ fontSize: 13 }}>
            {status?.type === 'saved' && <span style={{ color: 'var(--success)' }}>{savedMessage}</span>}
            {status?.type === 'error' && <span style={{ color: 'var(--danger)' }}>{status.message}</span>}
          </span>
        </div>
      </fieldset>
    </form>
  );
}
