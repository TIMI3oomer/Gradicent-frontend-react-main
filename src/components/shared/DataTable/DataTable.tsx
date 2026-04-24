import { useState, useMemo, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../../lib/cn';
import { Skeleton } from '../Skeleton';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T extends object> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
  rowKey?: keyof T;
}

export function DataTable<T extends object>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  emptyTitle = 'No results',
  emptyDescription,
  className,
  rowKey,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const av = (a as any)[sortKey] as string | number;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bv = (b as any)[sortKey] as string | number;
      const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (isLoading) {
    return (
      <div className={cn('data-table-wrap', className)}>
        <div className="data-table-loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} style={{ height: 44, borderRadius: 4, marginBottom: 1 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('data-table-wrap', className)}>
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  scope="col"
                  style={{ width: col.width }}
                  className={cn('data-th', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center')}
                >
                  {col.sortable ? (
                    <button className="sort-btn" onClick={() => handleSort(String(col.key))}>
                      {col.header}
                      {sortKey === String(col.key)
                        ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />)
                        : <ChevronsUpDown size={12} className="sort-icon-default" />}
                    </button>
                  ) : col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="data-table-empty">
                    <div className="empty-state-inline">
                      <div className="empty-state-title">{emptyTitle}</div>
                      {emptyDescription && <div className="empty-state-desc">{emptyDescription}</div>}
                    </div>
                  </td>
                </tr>
              ) : sorted.map((row, i) => (
                <motion.tr
                  key={rowKey ? String((row as Record<string, unknown>)[rowKey as string]) : i}
                  className={cn('data-row', onRowClick && 'data-row-clickable')}
                  onClick={() => onRowClick?.(row)}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.32), duration: 0.2 }}
                >
                  {columns.map(col => (
                    <td
                      key={String(col.key)}
                      className={cn('data-td', col.align === 'right' && 'text-right', col.align === 'center' && 'text-center')}
                    >
                      {col.render
                        ? col.render((row as Record<string, unknown>)[col.key as string], row)
                        : String((row as Record<string, unknown>)[col.key as string] ?? '')}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
