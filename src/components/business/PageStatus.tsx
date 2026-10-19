import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

/** Red error banner (same look as the original Clients page banner) with an optional Retry button. */
export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="biz-error-banner" role="alert">
      <span style={{ flex: 1, minWidth: 0 }}>{message}</span>
      {onRetry && (
        <button type="button" className="biz-error-retry" onClick={onRetry}>
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
    <div className="biz-loading" style={{ padding }} role="status" aria-live="polite">
      <div className="biz-loading-spinner" aria-hidden="true" />
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
    <div className="biz-notice" role="status">
      {icon && <div className="biz-notice-icon" aria-hidden="true">{icon}</div>}
      <div className="biz-notice-title">{title}</div>
      {children && <div className="biz-notice-desc">{children}</div>}
    </div>
  );
}
