import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '../../lib/cn';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  showFirstLast?: boolean;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize, showFirstLast = true, className }: PaginationProps) {
  const getPages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [];
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const start = totalItems && pageSize ? (page - 1) * pageSize + 1 : undefined;
  const end = totalItems && pageSize ? Math.min(page * pageSize, totalItems) : undefined;

  return (
    <div className={cn('pagination-wrap', className)}>
      {totalItems && (
        <span className="pagination-info">
          Showing {start}–{end} of {totalItems.toLocaleString()}
        </span>
      )}
      <div className="pagination-controls">
        {showFirstLast && (
          <button className="page-btn" onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">
            <ChevronsLeft size={14} />
          </button>
        )}
        <button className="page-btn" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft size={14} />
        </button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="page-ellipsis">...</span>
          ) : (
            <button
              key={p}
              className={cn('page-btn', page === p && 'page-btn-active')}
              onClick={() => onPageChange(p as number)}
              aria-label={`Page ${p}`}
              aria-current={page === p ? 'page' : undefined}
            >
              {p}
            </button>
          )
        )}
        <button className="page-btn" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
          <ChevronRight size={14} />
        </button>
        {showFirstLast && (
          <button className="page-btn" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">
            <ChevronsRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
