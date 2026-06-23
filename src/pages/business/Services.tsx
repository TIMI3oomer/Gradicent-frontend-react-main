import { useState, useEffect } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge } from '../../components/shared/Badge';
import { formatCurrency } from '../../lib/formatters';
import { Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export function Services() {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadServiceOfferings = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        
        let res;
        const cleanQuery = search.trim();

        if (!cleanQuery) {
          // Call GET list route when empty
          res = await api.fetchList<any>('/api/binder/services', {
            domain: 'business',
            user_id: user.id
          });
        } else {
          // Call POST search route when text exists
          res = await api.searchEntities<any>('/api/binder/services/search', {
            domain: 'business',
            user_id: user.id,
            query: cleanQuery
          });
        }

        const results = res.data?.services || res.data?.results || res.data || [];
        setServices(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('[Services] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      loadServiceOfferings();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [user?.id, search]);

  const totalRevenue = services.reduce((sum, s) => sum + (s.revenueYTD || 0), 0);

  return (
    <BusinessLayout title="Services Catalog">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search service items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card-bg)', color: 'var(--text)', fontSize: 14 }}
          />
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--primary)', color: '#fff', border: 0, borderRadius: 6, fontWeight: 500, cursor: 'pointer' }}>
          <Plus size={16} /> Create Offering
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Loading services array...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {services.map(svc => {
            const revenueShare = totalRevenue > 0 ? ((svc.revenueYTD || 0) / totalRevenue) * 100 : 0;
            return (
              <div key={svc.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'start', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ margin: 0, fontWeight: 600, color: 'var(--text)' }}>{svc.name}</h4>
                    <Badge status={svc.status as any} size="sm" />
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{svc.category}</span>
                    <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{svc.billingType}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{svc.description}</div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{ width: `${revenueShare}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(svc.basePrice || 0)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>base price</div>
                  <div style={{ fontSize: 13, color: '#22c55e', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(svc.revenueYTD || 0)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>YTD Rev</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BusinessLayout>
  );
}