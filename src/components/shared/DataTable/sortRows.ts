import { parseDate } from '../../../lib/formatters';

export type SortState = { key: string; dir: 'asc' | 'desc' } | null;

const isEmpty = (value: unknown) => value === null || value === undefined || value === '';

// Only treat strings that look like dates as dates, so plain text and numbers keep their own ordering
const DATE_LIKE = /^\d{4}-\d{2}-\d{2}|^[A-Z][a-z]{2},? \d{1,2} [A-Z][a-z]{2} \d{4}|^[A-Z][a-z]{2} \d{1,2},? \d{4}/;

function compareNonEmpty(av: unknown, bv: unknown) {
  const an = typeof av === 'number' ? av : Number(av);
  const bn = typeof bv === 'number' ? bv : Number(bv);
  if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
  if (typeof av === 'string' && typeof bv === 'string' && DATE_LIKE.test(av) && DATE_LIKE.test(bv)) {
    const ad = parseDate(av);
    const bd = parseDate(bv);
    if (ad && bd) return ad.getTime() - bd.getTime();
  }
  return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
}

export function sortRows<T extends object>(rows: T[], sort: SortState): T[] {
  if (!sort) return rows;
  return [...rows].sort((a, b) => {
    const av = (a as Record<string, unknown>)[sort.key];
    const bv = (b as Record<string, unknown>)[sort.key];
    // Empty values always sort last, whichever direction is chosen
    const aEmpty = isEmpty(av);
    const bEmpty = isEmpty(bv);
    if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
    const cmp = compareNonEmpty(av, bv);
    return sort.dir === 'asc' ? cmp : -cmp;
  });
}
