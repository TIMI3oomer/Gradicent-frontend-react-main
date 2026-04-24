import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../lib/formatters';

interface RevenueChartProps {
  data: { month: string; revenue: number; prevYear?: number }[];
  showPrevYear?: boolean;
  height?: number;
}

export function RevenueChart({ data, showPrevYear = true, height = 260 }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1171BB" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#1171BB" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="prevGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9AAEC5" stopOpacity={0.1} />
            <stop offset="95%" stopColor="#9AAEC5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border, #DDE4EE)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: 'var(--text-muted, #5A6880)' }}
          axisLine={false} tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-muted, #5A6880)' }}
          axisLine={false} tickLine={false}
          tickFormatter={v => formatCurrency(v as number, true)}
          width={60}
        />
        <Tooltip
          formatter={(value: number, name: string) => [formatCurrency(value), name]}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid var(--border, #DDE4EE)',
            background: 'var(--surface, #fff)',
            fontSize: 12,
          }}
        />
        {showPrevYear && (
          <Area
            type="monotone"
            dataKey="prevYear"
            name="Previous Year"
            stroke="#9AAEC5"
            strokeWidth={1.5}
            strokeDasharray="5 3"
            fill="url(#prevGrad)"
            dot={false}
          />
        )}
        <Area
          type="monotone"
          dataKey="revenue"
          name="This Year"
          stroke="#1171BB"
          strokeWidth={2}
          fill="url(#revGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#1171BB' }}
        />
        {showPrevYear && <Legend wrapperStyle={{ fontSize: 11 }} />}
      </AreaChart>
    </ResponsiveContainer>
  );
}
