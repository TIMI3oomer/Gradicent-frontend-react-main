import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

/** Red error banner with an optional Retry button (used by the business and medical dashboards). */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="page-error-banner" role="alert">
      <span style={{ flex: 1, minWidth: 0 }}>{message}</span>
      {onRetry && (
        <button type="button" className="page-error-retry" onClick={onRetry}>
          <RefreshCw size={13} aria-hidden="true" /> Retry
        </button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  label: string;
  padding?: string | number;
}

export function LoadingState({ label, padding = '64px 0' }: LoadingStateProps) {
  return (
    <div className="page-loading" style={{ padding }} role="status" aria-live="polite">
      <div className="page-loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

interface NoticeProps {
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
}

/** Neutral, friendly notice used when a feature's backend endpoint is not available yet. */
export function UnavailableNotice({ title, children, icon }: NoticeProps) {
  return (
    <div className="page-notice" role="status">
      {icon && <div className="page-notice-icon" aria-hidden="true">{icon}</div>}
      <div className="page-notice-title">{title}</div>
      {children && <div className="page-notice-desc">{children}</div>}
    </div>
  );
}
