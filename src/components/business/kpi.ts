// Helpers for building KPI cards from the Gaia business_dashboard metrics.
// Trends are only shown when the API actually provides the comparison value —
// never hardcoded.

export type KpiTrend = { trend?: 'up' | 'down' | 'neutral'; trendValue?: string };

function finite(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Relative change, e.g. "+12.4% vs last month". */
export function percentChangeTrend(current: unknown, previous: unknown, label: string): KpiTrend {
  const c = finite(current);
  const p = finite(previous);
  if (c === null || p === null || p === 0) return {};
  const pct = ((c - p) / Math.abs(p)) * 100;
  const rounded = Math.round(pct * 10) / 10;
  return {
    trend: rounded > 0 ? 'up' : rounded < 0 ? 'down' : 'neutral',
    trendValue: `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}% ${label}`,
  };
}

/** Absolute change in percentage points, e.g. "-0.8 pts vs last month" (for rates such as churn). */
export function pointChangeTrend(current: unknown, previous: unknown, label: string): KpiTrend {
  const c = finite(current);
  const p = finite(previous);
  if (c === null || p === null) return {};
  const diff = Math.round((c - p) * 10) / 10;
  return {
    trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
    trendValue: `${diff > 0 ? '+' : ''}${diff.toFixed(1)} pts ${label}`,
  };
}

/** Count trend, e.g. "+5 new this month". */
export function countTrend(count: unknown, label: string): KpiTrend {
  const n = finite(count);
  if (n === null) return {};
  return { trend: n > 0 ? 'up' : 'neutral', trendValue: `${n > 0 ? '+' : ''}${n} ${label}` };
}

export function metricNumber(value: unknown): number {
  return finite(value) ?? 0;
}
