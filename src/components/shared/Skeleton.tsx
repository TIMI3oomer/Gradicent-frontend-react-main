import { cn } from '../../lib/cn';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn('skeleton animate-shimmer', className)} style={style} />;
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('skeleton-text-group', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="skeleton-text-line"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card-skeleton">
      <Skeleton style={{ width: 40, height: 40, borderRadius: 8, marginBottom: 12 }} />
      <Skeleton style={{ width: '60%', height: 14, borderRadius: 4, marginBottom: 8 }} />
      <Skeleton style={{ width: '40%', height: 28, borderRadius: 4, marginBottom: 8 }} />
      <Skeleton style={{ width: '80%', height: 12, borderRadius: 4 }} />
    </div>
  );
}
