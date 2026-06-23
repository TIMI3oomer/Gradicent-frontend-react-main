import { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Product } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export function BusinessProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Discontinued' | 'Draft'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  useEffect(() => {
    const fetchCatalog = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        
        let res;
        const cleanQuery = search.trim();

        if (!cleanQuery) {
          // Standard GET listing path
          res = await api.fetchList<any>('/api/binder/products', {
            domain: 'business',
            user_id: user.id
          });
        } else {
          // Switch to search route if text is typed
          res = await api.searchEntities<any>('/api/binder/products/search', {
            domain: 'business',
            user_id: user.id,
            query: cleanQuery
          });
        }

        const results = res.data?.products || res.data?.results || res.data || [];
        setProducts(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('[Products Ledger] Sync Failure:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchCatalog();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [user?.id, search]);

  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category).filter(Boolean));
    return ['All', ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      return true;
    });
  }, [products, statusFilter, categoryFilter]);

  const columns: Column<Product>[] = [
    { key: 'name', header: 'Product Name', sortable: true, render: (v, row) => <div style={{ fontWeight: 600, color: 'var(--text)' }}>{String(v)}</div> },
    { key: 'sku', header: 'SKU', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{String(v)}</span> },
    { key: 'category', header: 'Category', render: v => <span style={{ fontSize: 12, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>{String(v)}</span> },
    {
      key: 'price', header: 'Price', align: 'right', sortable: true, render: (v) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{formatCurrency(Number(v))}</div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> }
  ];

  return (
    <BusinessLayout title="Products">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 280 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Filter catalog array..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
            />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}>
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Discontinued">Discontinued</option>
            <option value="Draft">Draft</option>
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)' }}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}><Plus size={16} /> Add Product</button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading product catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Package size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No Products Found</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No items matched your search criteria.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <DataTable data={filtered} columns={columns} rowKey="id" />
        </div>
      )}
    </BusinessLayout>
  );
}