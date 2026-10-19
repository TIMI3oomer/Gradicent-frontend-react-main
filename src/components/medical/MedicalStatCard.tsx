import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';
import { cn } from '../../lib/cn';

interface MedicalStatCardProps {
  title: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
  index?: number;
  decimals?: number;
  /**
   * Set when a decrease is the good outcome (e.g. wait time, visit duration):
   * the arrow still follows `trend`, but the colour shows it as positive.
   */
  lowerIsBetter?: boolean;
}

export function MedicalStatCard({ title, value, unit, trend, trendValue, icon, index = 0, decimals = 0, lowerIsBetter = false }: MedicalStatCardProps) {
  const displayed = useCountUp(value, 1200, index * 80);
  // trend-up = green, trend-down = red in components.css; flip the colour when lower is better
  const tone = trend === 'neutral' || !trend
    ? 'neutral'
    : (trend === 'up') !== lowerIsBetter ? 'up' : 'down';

  return (
    <motion.div
      className="stat-card stat-card-medical"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -2 }}
    >
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div className="stat-card-label">{title}</div>
      <div className="stat-card-value font-tabular">
        {decimals > 0 ? (displayed / Math.pow(10, decimals)).toFixed(decimals) : displayed.toLocaleString()}
        {unit && <span className="stat-card-unit">{unit}</span>}
      </div>
      {trend && trendValue && (
        <div className={cn('stat-card-trend', `trend-${tone}`)}>
          {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
          <span>{trendValue}</span>
        </div>
      )}
    </motion.div>
  );
}
