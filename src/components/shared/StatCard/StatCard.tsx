import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '../../../hooks/useCountUp';
import { StatCardSkeleton } from '../Skeleton';
import { cn } from '../../../lib/cn';

interface StatCardProps {
  title: string;
  value: number;
  unit?: string;
  prefix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  variant?: 'medical' | 'business';
  isLoading?: boolean;
  index?: number;
  decimals?: number;
}

export function StatCard({
  title,
  value,
  unit,
  prefix,
  trend,
  trendValue,
  icon,
  variant = 'business',
  isLoading = false,
  index = 0,
  decimals = 0,
}: StatCardProps) {
  // useCountUp counts in whole numbers, so count in units of 10^-decimals and scale back
  const scale = Math.pow(10, decimals);
  const safeValue = Number.isFinite(value) ? value : 0;
  const countedValue = useCountUp(Math.round(safeValue * scale), 1200, index * 80);

  if (isLoading) return <StatCardSkeleton />;

  const displayValue = decimals > 0
    ? (countedValue / scale).toFixed(decimals)
    : countedValue.toLocaleString('en-US');

  return (
    <motion.div
      className={cn('stat-card', `stat-card-${variant}`)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
    >
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div className="stat-card-label">{title}</div>
      <div className="stat-card-value font-tabular">
        {prefix && <span className="stat-card-prefix">{prefix}</span>}
        {displayValue}
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
      {trend && trendValue && (
        <motion.div
          className={cn('stat-card-trend', `trend-${trend}`)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.08 + 0.2 }}
        >
          {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
          <span>{trendValue}</span>
        </motion.div>
      )}
    </motion.div>
  );
}
