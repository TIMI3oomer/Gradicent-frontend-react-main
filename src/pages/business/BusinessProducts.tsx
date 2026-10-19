import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { ErrorBanner, LoadingState } from '../../components/business/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, toArray } from '../../components/business/apiHelpers';
import { formatCurrency } from '../../lib/formatters';
import type { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

type StatusFilter = 'All' | 'Active' | 'Discontinued' | 'Draft';

export function BusinessProducts() {
  const { user, isLoading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    // Ignore responses from earlier keystrokes that resolve after a newer request
    let ignore = false;

    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cleanQuery = search.trim();
        const res = cleanQuery
          ? await api.searchEntities<unknown>('/api/binder/products/search', {
              domain: 'business',
              user_id: userId,
              query: cleanQuery,
            })
          : await api.fetchList<unknown>('/api/binder/products', {
              domain: 'business',
              user_id: userId,
            });

        if (ignore) return;
        setProducts(toArray<Product>(res, 'products'));
      } catch (err) {
        if (ignore) return;
        console.error('[Products] Fetch error:', err);
        setProducts([]);
        setError(errorMessage(err, 'Could not load your products.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchCatalog, 300);

    return () => {
      ignore = true;
      clearTimeout(delayDebounce);
    };
  }, [user?.id, authLoading, search, reloadKey]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (statusFilter !== 'All' && String(p.status ?? '').toLowerCase() !== statusFilter.toLowerCase()) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      return true;
    });
  }, [products, statusFilter, categoryFilter]);

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Product', sortable: true, render: v => <div style={{ fontWeight: 600, color: 'var(--text)' }}>{v ? String(v) : '—'}</div> },
    { key: 'sku', header: 'SKU', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v ? String(v) : '—'}</span> },
    { key: 'category', header: 'Category', render: v => (v ? <span style={{ fontSize: 12, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>{String(v)}</span> : '—') },
    {
      key: 'price', header: 'Price', align: 'right', sortable: true, render: v => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{formatCurrency(v)}</div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
  ];

  const selectStyle = { padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' };

  return (
    <BusinessLayout title="Products">
      <div className="biz-toolbar">
        <div className="biz-toolbar-filters">
          <div className="biz-search" style={{ maxWidth: 320 }}>
            <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="search"
              placeholder="Search products..."
              aria-label="Search products"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
            />
          </div>
          <select aria-label="Filter by status" value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} style={selectStyle}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Discontinued">Discontinued</option>
            <option value="Draft">Draft</option>
          </select>
          <select aria-label="Filter by category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={selectStyle}>
            {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
          </select>
        </div>
        {/* No create-product form exists yet, so keep the action visible but inactive */}
        <button
          type="button"
          disabled
          title="Coming soon"
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 500, cursor: 'not-allowed', opacity: 0.55 }}
        >
          <Plus size={16} aria-hidden="true" /> Add Product
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

      {isLoading ? (
        <LoadingState label="Loading products..." padding={48} />
      ) : error ? null : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Package size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} aria-hidden="true" />
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No Products Found</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {search || statusFilter !== 'All' || categoryFilter !== 'All' ? 'No products match your search or filters.' : 'Products you sell will appear here.'}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <DataTable data={filtered} columns={columns} rowKey="id" />
        </div>
      )}
    </BusinessLayout>
  );
}
