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

export function Badge({ status, variant, size = 'md', withDot, children, className }: BadgeProps) {
  const v = status ?? variant ?? 'default';
  const colorClass = variantMap[v] ?? 'badge-default';
  const sizeClass = { sm: 'badge-sm', md: 'badge-md', lg: 'badge-lg' }[size];

  return (
    <span className={cn('badge', colorClass, sizeClass, className)}>
      {withDot && <span className={cn('badge-dot', v === 'Active' && 'badge-dot-pulse')} aria-hidden="true" />}
      {children ?? v}
    </span>
  );
}
