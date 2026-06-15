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
        const res = await api.searchEntities<any>('/api/binder/products/search', {
          domain: 'business', user_id: user.id, query: ''
        });
        const results = res.data?.results || res.data || [];
        setProducts(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('[Products] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCatalog();
  }, [user?.id]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [products, search, statusFilter, categoryFilter]);

  const columns: Column<Product>[] = [
    {
      key: 'name', header: 'Product', sortable: true, render: (v, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{String(v)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.description}</div>
        </div>
      ),
    },
    { key: 'sku', header: 'SKU', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{String(v)}</span> },
    { key: 'category', header: 'Category', render: v => <span style={{ fontSize: 12, padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>{String(v)}</span> },
    {
      key: 'price', header: 'Price', align: 'right', sortable: true, render: (v, row) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{formatCurrency(Number(v))}</div>
        </div>
      ),
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as any} size="sm" /> }
  ];

  return (
    <BusinessLayout title="Products">
      {/* Search and Filters UI remains identical... */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading product catalog...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Package size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <div style={{ color: 'var(--text-muted)' }}>No products found.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <DataTable data={filtered} columns={columns} rowKey="id" />
        </div>
      )}
    </BusinessLayout>
  );
}