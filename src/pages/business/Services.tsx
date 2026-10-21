import { useState, useEffect } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { EmptyState } from '../../components/shared/EmptyState';
import { ErrorBanner, LoadingState } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, toArray, toNumber } from '../../components/shared/apiHelpers';
import { formatCurrency } from '../../lib/formatters';
import { Briefcase, Plus, Search } from 'lucide-react';
import type { Service } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { QuickAddModal, type QuickAddField } from '../../components/business/QuickAddModal';

const SERVICE_FIELDS: QuickAddField[] = [
  { key: 'name', label: 'Service name', required: true },
  { key: 'category', label: 'Category' },
  { key: 'billingType', label: 'Billing', type: 'select', options: ['Fixed', 'Hourly', 'Monthly'] },
  { key: 'basePrice', label: 'Base price', type: 'number', min: 0, placeholder: '0.00' },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Draft', 'Discontinued'] },
  { key: 'description', label: 'Description', type: 'textarea' },
];

export function Services() {
  const { user, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');

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

    const loadServices = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cleanQuery = search.trim();
        const res = cleanQuery
          ? await api.searchEntities<unknown>('/api/binder/services/search', {
              domain: 'business',
              user_id: userId,
              query: cleanQuery,
            })
          : await api.fetchList<unknown>('/api/binder/services', {
              domain: 'business',
              user_id: userId,
            });

        if (ignore) return;
        setServices(toArray<Service>(res, 'services'));
      } catch (err) {
        if (ignore) return;
        console.error('[Services] Fetch error:', err);
        setServices([]);
        setError(errorMessage(err, 'Could not load your services.'));
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(loadServices, 300);

    return () => {
      ignore = true;
      clearTimeout(delayDebounce);
    };
  }, [user?.id, authLoading, search, reloadKey]);

  const totalRevenue = services.reduce((sum, s) => sum + toNumber(s.revenueYTD), 0);

  return (
    <BusinessLayout title="Services">
      <div className="biz-toolbar">
        <div className="biz-search">
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="search"
            placeholder="Search services..."
            aria-label="Search services"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
          />
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}
        >
          <Plus size={16} aria-hidden="true" /> Add Service
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={user?.id ? () => setReloadKey(k => k + 1) : undefined} />}

      {isLoading ? (
        <LoadingState label="Loading services..." padding={48} />
      ) : error ? null : services.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={32} />}
          title="No Services Found"
          description={search ? 'No services match your search.' : 'Services you offer will appear here.'}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: 16 }}>
          {services.map((svc, i) => {
            const revenue = toNumber(svc.revenueYTD);
            const revenueShare = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
            return (
              <div key={svc.id ?? i} className="card" style={{ display: 'flex', gap: 16, alignItems: 'start', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 180px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>{svc.name || '—'}</h4>
                    {svc.status && <Badge status={svc.status as BadgeVariant} size="sm" />}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    {svc.category && <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{svc.category}</span>}
                    {svc.billingType && <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{svc.billingType}</span>}
                  </div>
                  {svc.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{svc.description}</div>}
                  <div
                    style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}
                    role="img"
                    aria-label={`${Math.round(revenueShare)}% of revenue`}
                  >
                    <div style={{ width: `${revenueShare}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(svc.basePrice)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>base price</div>
                  <div style={{ fontSize: 13, color: '#22c55e', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(svc.revenueYTD)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Revenue YTD</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <QuickAddModal
        isOpen={adding}
        onClose={() => setAdding(false)}
        onCreated={() => setReloadKey(k => k + 1)}
        title="Add Service"
        entity="service"
        endpoint="/api/binder/services"
        fields={SERVICE_FIELDS}
        submitLabel="Add Service"
      />
    </BusinessLayout>
  );
}
