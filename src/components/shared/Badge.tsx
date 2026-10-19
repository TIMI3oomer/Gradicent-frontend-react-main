import { cn } from '../../lib/cn';

export type BadgeVariant =
  | 'Active' | 'Discharged' | 'Pending' | 'Churned' | 'Lead'
  | 'Pro' | 'Enterprise' | 'Basic'
  | 'Paid' | 'Failed' | 'Cancelled'
  | 'Scheduled' | 'Completed' | 'No-show'
  | 'success' | 'warning' | 'error' | 'info' | 'default'
  | 'On Leave' | 'Terminated'
  | 'Discontinued' | 'Draft' | 'Inactive';

const variantMap: Record<BadgeVariant, string> = {
  Active: 'badge-success',
  Scheduled: 'badge-info',
  Completed: 'badge-success',
  Paid: 'badge-success',
  Lead: 'badge-info',
  Pro: 'badge-blue',
  Enterprise: 'badge-purple',
  Basic: 'badge-default',
  Discharged: 'badge-default',
  Pending: 'badge-warning',
  Churned: 'badge-danger',
  Failed: 'badge-danger',
  Cancelled: 'badge-default',
  'No-show': 'badge-warning',
  'On Leave': 'badge-warning',
  Terminated: 'badge-danger',
  Discontinued: 'badge-danger',
  Draft: 'badge-warning',
  Inactive: 'badge-default',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-danger',
  info: 'badge-info',
  default: 'badge-default',
};

interface BadgeProps {
  status?: BadgeVariant;
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  withDot?: boolean;
  children?: React.ReactNode;
  className?: string;
}

// API values often arrive lowercase ("active", "paid"), so match variants case-insensitively
const variantLookup = new Map(
  (Object.keys(variantMap) as BadgeVariant[]).map(key => [key.toLowerCase(), key] as const),
);

export function Badge({ status, variant, size = 'md', withDot, children, className }: BadgeProps) {
  const raw = status ?? variant;
  const v: BadgeVariant = (raw && variantLookup.get(String(raw).toLowerCase())) || 'default';
  const colorClass = variantMap[v] ?? 'badge-default';
  const sizeClass = { sm: 'badge-sm', md: 'badge-md', lg: 'badge-lg' }[size];
  // Never show the internal "default" variant name as a label
  const label = children ?? (raw ? String(raw) : '—');

  return (
    <span className={cn('badge', colorClass, sizeClass, className)}>
      {withDot && <span className={cn('badge-dot', v === 'Active' && 'badge-dot-pulse')} aria-hidden="true" />}
      {label}
    </span>
  );
}
