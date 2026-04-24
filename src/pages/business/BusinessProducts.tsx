import { useState, useMemo } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { Badge } from '../../components/shared/Badge';
import { mockProducts } from '../../data/products';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Product } from '../../types';

export function BusinessProducts() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Discontinued' | 'Draft'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(mockProducts.map(p => p.category)))], []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return mockProducts.filter(p => {
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [search, statusFilter, categoryFilter]);

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
          <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>{formatCurrency(v as number)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.unit}</div>
        </div>
      ),
    },
    {
      key: 'inventory', header: 'Inventory', align: 'right', render: v =>
        v === null ? <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>N/A</span>
          : <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{String(v)}</span>,
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Active' | 'Discontinued' | 'Draft'} size="sm" /> },
    { key: 'updatedAt', header: 'Updated', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(v as string, 'short')}</span> },
  ];

  return (
    <BusinessLayout title="Products">
      <div className="filter-row" style={{ marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: '0 0 260px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 32, height: 36 }}
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['All', 'Active', 'Discontinued', 'Draft'] as const).map(s => (
            <button key={s} className={statusFilter === s ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setStatusFilter(s)}>{s}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {categories.map(c => (
            <button key={c} className={categoryFilter === c ? 'btn-primary btn-sm' : 'btn-ghost btn-sm'} onClick={() => setCategoryFilter(c)}>{c}</button>
          ))}
        </div>
        <button className="btn-primary btn-sm" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <Package size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
          <div style={{ color: 'var(--text-muted)' }}>No products found.</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <DataTable
            data={filtered}
            columns={columns}
            rowKey="id"
            emptyTitle="No products match your filters."
          />
        </div>
      )}
    </BusinessLayout>
  );
}
