import { cn } from '../../lib/cn';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { xs: 12, sm: 16, md: 24, lg: 36 };

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const px = sizes[size];
  return (
    <span
      className={cn('spinner', className)}
      style={{ width: px, height: px }}
      role="status"
      aria-label="Loading"
    />
  );
}
