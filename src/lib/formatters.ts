const EMPTY = '—';

// Values from the API may arrive as strings, null or undefined
function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

// "YYYY-MM-DD" strings are parsed as UTC midnight by `new Date()`, which shows the previous
// day for anyone west of UTC. Treat date-only strings as local dates instead.
export function parseDate(value: string | number | Date | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
    if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Local calendar date as YYYY-MM-DD (toISOString() would shift it to UTC)
export function toLocalIsoDate(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatCurrency(amount: number | string | null | undefined, compact = false): string {
  const value = toNumber(amount);
  if (value === null) return EMPTY;
  if (compact && Math.abs(value) >= 1000000) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(value / 1000000) + 'M';
  }
  if (compact && Math.abs(value) >= 1000) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value / 1000) + 'k';
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

export function formatNumber(value: number | string | null | undefined, compact = false): string {
  const n = toNumber(value);
  if (n === null) return EMPTY;
  if (compact && Math.abs(n) >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (compact && Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
  return new Intl.NumberFormat('en-US').format(n);
}

export function formatPercent(value: number | string | null | undefined, decimals = 1): string {
  const n = toNumber(value);
  if (n === null) return EMPTY;
  return `${n.toFixed(decimals)}%`;
}

export function formatDate(dateStr: string | number | Date | null | undefined, style: 'short' | 'medium' | 'long' = 'medium'): string {
  const date = parseDate(dateStr);
  if (!date) return EMPTY;
  if (style === 'short') return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (style === 'long') return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatRelativeTime(dateStr: string | null | undefined): string {
  const date = parseDate(dateStr);
  if (!date) return EMPTY;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date, 'short');
}

export function calculateAge(dob: string | null | undefined): number {
  const birth = parseDate(dob);
  if (!birth) return 0;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function getInitials(name: string | null | undefined): string {
  return (name ?? '').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

export function generateAvatarColor(name: string | null | undefined): string {
  const colors = [
    '#CE7A35', '#78CEE6', '#4CAF7D', '#E8A838', '#D95C5C',
    '#1171BB', '#7C3AED', '#FF9F1C', '#22C55E', '#F59E0B',
  ];
  const source = name ?? '';
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = source.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
