import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Globe, MapPin, Building2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge } from '../../components/shared/Badge';
import { PlanBadge } from '../../components/business/PlanBadge';
import { Avatar } from '../../components/shared/Avatar';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { mockClients } from '../../data/clients';
import { mockTransactions } from '../../data/transactions';
import { mockAppointments } from '../../data/appointments';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Transaction, Appointment } from '../../types';

const TABS = ['Overview', 'Transactions', 'Appointments', 'Notes'];

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');

  const client = mockClients.find(c => c.id === id);

  if (!client) {
    return (
      <BusinessLayout title="Client Not Found">
        <div style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 16 }}>Client not found.</div>
          <button className="btn-primary btn-md" onClick={() => navigate('/business/clients')}>Back to Clients</button>
        </div>
      </BusinessLayout>
    );
  }

  const txns = mockTransactions.filter(t => t.clientId === client.id);
  const apts = mockAppointments.filter(a => a.attendeeId === client.id || a.type === 'Business');

  const txnCols: Column<Transaction>[] = [
    { key: 'invoiceNumber', header: 'Invoice', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{String(v ?? '—')}</span> },
    { key: 'type', header: 'Type', render: v => <span style={{ fontSize: 12 }}>{String(v)}</span> },
    { key: 'description', header: 'Description', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{String(v)}</span> },
    {
      key: 'amount', header: 'Amount', align: 'right', sortable: true, render: v => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#22c55e', fontSize: 13 }}>{formatCurrency(v as number)}</span>
      ),
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Paid' | 'Pending' | 'Failed' | 'Cancelled'} size="sm" /> },
    { key: 'date', header: 'Date', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(v as string, 'short')}</span> },
  ];

  const aptCols: Column<Appointment>[] = [
    { key: 'title', header: 'Title', render: v => <span style={{ fontSize: 13, fontWeight: 600 }}>{String(v)}</span> },
    { key: 'date', header: 'Date', render: v => <span style={{ fontSize: 12 }}>{formatDate(v as string, 'short')}</span> },
    { key: 'time', header: 'Time', render: v => <span style={{ fontSize: 12 }}>{String(v)}</span> },
    { key: 'hostName', header: 'Host', render: v => <span style={{ fontSize: 12 }}>{String(v)}</span> },
    { key: 'status', header: 'Status', render: v => <Badge status={v as 'Scheduled' | 'Completed' | 'Cancelled'} size="sm" /> },
  ];

  return (
    <BusinessLayout title={client.name}>
      <button
        className="btn-ghost btn-sm"
        onClick={() => navigate('/business/clients')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}
      >
        <ArrowLeft size={14} /> Back to Clients
      </button>

      {/* Hero */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar name={client.name} size="xl" />
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{client.name}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>{client.company} · {client.industry}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <PlanBadge plan={client.plan} />
                <Badge status={client.status} />
                {client.tags.map(tag => (
                  <span key={tag} style={{ padding: '2px 8px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, color: 'var(--text-muted)' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 120px)', gap: 16, textAlign: 'center' }}>
            {[
              { label: 'Revenue YTD', value: formatCurrency(client.revenueYTD), color: '#22c55e' },
              { label: 'MRR', value: formatCurrency(client.mrr), color: 'var(--primary)' },
              { label: 'Since', value: formatDate(client.joinDate, 'short'), color: 'var(--text)' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 8px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'var(--font-dm-sans)',
            }}
          >{t}</button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="two-col">
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Contact Info</div>
            {[
              { icon: <Mail size={14} />, label: 'Email', value: client.email },
              { icon: <Phone size={14} />, label: 'Phone', value: client.phone },
              { icon: <Globe size={14} />, label: 'Website', value: client.website },
              { icon: <MapPin size={14} />, label: 'Address', value: client.address },
              { icon: <Building2 size={14} />, label: 'Industry', value: client.industry },
              { icon: <Calendar size={14} />, label: 'Last Interaction', value: formatDate(client.lastInteraction, 'long') },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Notes</div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7 }}>{client.notes || 'No notes yet.'}</p>
          </div>
        </div>
      )}

      {tab === 'Transactions' && (
        <div className="card" style={{ padding: 0 }}>
          <DataTable
            data={txns}
            columns={txnCols}
            rowKey="id"
            emptyTitle="No transactions for this client."
          />
        </div>
      )}

      {tab === 'Appointments' && (
        <div className="card" style={{ padding: 0 }}>
          <DataTable
            data={apts}
            columns={aptCols}
            rowKey="id"
            emptyTitle="No appointments for this client."
          />
        </div>
      )}

      {tab === 'Notes' && (
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Client Notes</div>
          <textarea
            className="form-input"
            style={{ minHeight: 200, resize: 'vertical', lineHeight: 1.6 }}
            defaultValue={client.notes}
            placeholder="Add notes about this client..."
          />
          <button className="btn-primary btn-md" style={{ marginTop: 12 }}>Save Notes</button>
        </div>
      )}
    </BusinessLayout>
  );
}
