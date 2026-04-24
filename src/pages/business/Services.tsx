import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge } from '../../components/shared/Badge';
import { mockServices } from '../../data/services';
import { formatCurrency } from '../../lib/formatters';
import { Plus, TrendingUp } from 'lucide-react';

export function Services() {
  const totalRevenue = mockServices.reduce((sum, s) => sum + s.revenueYTD, 0);
  const totalClients = mockServices.reduce((sum, s) => sum + s.clientCount, 0);
  const active = mockServices.filter(s => s.status === 'Active').length;

  return (
    <BusinessLayout title="Services">
      <div className="three-col" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Services', value: String(mockServices.length) },
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {mockServices.map(svc => {
          const revenueShare = Math.round((svc.revenueYTD / totalRevenue) * 100);
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
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>{formatCurrency(svc.basePrice)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>base price</div>
                <div style={{ fontSize: 13, color: '#22c55e', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatCurrency(svc.revenueYTD)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{svc.clientCount} clients</div>
              </div>
            </div>
          );
        })}
      </div>
    </BusinessLayout>
  );
}
