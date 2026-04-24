import { cn } from '../../lib/cn';

interface PlanBadgeProps {
  plan: 'Basic' | 'Pro' | 'Enterprise';
  size?: 'sm' | 'md';
}

export function PlanBadge({ plan, size = 'md' }: PlanBadgeProps) {
  return (
    <span className={cn(
      'badge',
      plan === 'Basic' && 'badge-default',
      plan === 'Pro' && 'badge-blue',
      plan === 'Enterprise' && 'badge-purple',
      size === 'sm' ? 'badge-sm' : 'badge-md'
    )}>
      {plan}
    </span>
  );
}
