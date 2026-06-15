import { useState, useEffect } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge } from '../../components/shared/Badge';
import { formatCurrency } from '../../lib/formatters';
import { Plus, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

export function Services() {
  const { user } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadServiceOfferings = async () => {
      if (!user?.id) return;
      try {
        setIsLoading(true);
        const res = await api.searchEntities<any>('/api/binder/services/search', { domain: 'business', user_id: user.id, query: '' });
        const results = res.data?.results || res.data || [];
        setServices(Array.isArray(results) ? results : []);
      } catch (err) {
        console.error('[Services] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadServiceOfferings();
  }, [user?.id]);

  const totalRevenue = services.reduce((sum, s) => sum + (s.revenueYTD || 0), 0);
  const totalClients = services.reduce((sum, s) => sum + (s.clientCount || 0), 0);
  const active = services.filter(s => s.status === 'Active').length;

  return (
    <BusinessLayout title="Services">
      <div className="three-col" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Services', value: String(services.length) },
          { label: 'Active', value: String(active) },
          { label: 'Revenue YTD', value: formatCurrency(totalRevenue) },
          { label: 'Client Subscriptions', value: String(totalClients) },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>All Services</div>
        <button className="btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Plus size={14} /> Add Service
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Retrieving service ledger...</div>
      ) : services.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>No service offerings defined.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {services.map(svc => {
            const revenueShare = totalRevenue > 0 ? Math.round(((svc.revenueYTD || 0) / totalRevenue) * 100) : 0;
            return (
              <div key={svc.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <TrendingUp size={20} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{svc.name}</div>
                    <Badge status={svc.status as 'Active' | 'Inactive'} size="sm" />
                    <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{svc.category}</span>
                    <span style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11 }}>{svc.billingType}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{svc.description}</div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2 }}>
                    <div style={{ width: `${revenueShare}%`, height: '100%', background: 'var(--primary)', borderRadius: 2, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(svc.basePrice || 0)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>base price</div>
                  <div style={{ fontSize: 13, color: '#22c55e', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(svc.revenueYTD || 0)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{svc.clientCount || 0} clients</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </BusinessLayout>
  );
}