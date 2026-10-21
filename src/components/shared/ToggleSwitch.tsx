interface ToggleSwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** id of the element that names the switch */
  labelledBy: string;
  describedBy?: string;
  disabled?: boolean;
  /** CSS colour for the "on" state, e.g. var(--primary) or var(--accent) */
  onColor?: string;
}

/** Accessible on/off switch used on the settings pages. */
export function ToggleSwitch({ checked, onChange, labelledBy, describedBy, disabled = false, onColor = 'var(--primary)' }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 24, borderRadius: 12,
        background: checked ? onColor : 'var(--border)',
        border: 'none', position: 'relative', flexShrink: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'background 0.15s',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'block', width: 18, height: 18, borderRadius: '50%', background: 'white',
          position: 'absolute', top: 3, left: checked ? 23 : 3,
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.15s',
        }}
      />
    </button>
  );
}
