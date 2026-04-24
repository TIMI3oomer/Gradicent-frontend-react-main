import { type ReactNode } from 'react';
import { StatCard } from '../shared/StatCard/StatCard';

interface KPIItem {
  title: string;
  value: number;
  unit?: string;
  prefix?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: ReactNode;
}

interface KPIGridProps {
  items: KPIItem[];
  isLoading?: boolean;
  columns?: 4 | 5;
}

export function KPIGrid({ items, isLoading = false, columns = 4 }: KPIGridProps) {
  return (
    <div className={columns === 5 ? 'kpi-grid-5' : 'kpi-grid'} style={{ marginBottom: 20 }}>
      {items.map((item, i) => (
        <StatCard
          key={item.title}
          {...item}
          variant="business"
          isLoading={isLoading}
          index={i}
        />
      ))}
    </div>
  );
}
