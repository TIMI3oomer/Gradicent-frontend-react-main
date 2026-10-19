export type SortState = { key: string; dir: 'asc' | 'desc' } | null;

function compareValues(av: unknown, bv: unknown) {
  // Empty values always sort last
  const aEmpty = av === null || av === undefined || av === '';
  const bEmpty = bv === null || bv === undefined || bv === '';
  if (aEmpty || bEmpty) return aEmpty === bEmpty ? 0 : aEmpty ? 1 : -1;
  const an = typeof av === 'number' ? av : Number(av);
  const bn = typeof bv === 'number' ? bv : Number(bv);
  if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
  return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: 'base' });
}

export function sortRows<T extends object>(rows: T[], sort: SortState): T[] {
  if (!sort) return rows;
  return [...rows].sort((a, b) => {
    const cmp = compareValues((a as Record<string, unknown>)[sort.key], (b as Record<string, unknown>)[sort.key]);
    return sort.dir === 'asc' ? cmp : -cmp;
  });
}
