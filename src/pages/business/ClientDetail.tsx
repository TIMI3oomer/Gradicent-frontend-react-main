import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Globe, MapPin, Building2, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BusinessLayout } from '../../layouts/BusinessLayout/BusinessLayout';
import { Badge, type BadgeVariant } from '../../components/shared/Badge';
import { PlanBadge } from '../../components/business/PlanBadge';
import { ErrorBanner, LoadingState, UnavailableNotice } from '../../components/shared/PageStatus';
import { SIGNED_OUT_MESSAGE, errorMessage, isMissingEndpoint, toArray, toNumber, toRecord } from '../../components/shared/apiHelpers';
import { Avatar } from '../../components/shared/Avatar';
import { DataTable, type Column } from '../../components/shared/DataTable/DataTable';
import { BUSINESS_ROUTES } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/formatters';
import type { Client, Transaction, Appointment } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const TABS = ['Overview', 'Transactions', 'Appointments', 'Notes'] as const;
type Tab = typeof TABS[number];
type ListState<T> = { rows: T[]; error: string | null; unavailable: boolean };

const emptyList = <T,>(): ListState<T> => ({ rows: [], error: null, unavailable: false });

function toListState<T>(result: PromiseSettledResult<unknown>, key: string, fallback: string): ListState<T> {
  if (result.status === 'fulfilled') return { rows: toArray<T>(result.value, key), error: null, unavailable: false };
  if (isMissingEndpoint(result.reason)) return { rows: [], error: null, unavailable: true };
  return { rows: [], error: errorMessage(result.reason, fallback), unavailable: false };
}

export function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [tab, setTab] = useState<Tab>('Overview');

  // Data State
  const [client, setClient] = useState<Client | null>(null);
  const [txns, setTxns] = useState<ListState<Transaction>>(emptyList);
  const [apts, setApts] = useState<ListState<Appointment>>(emptyList);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Notes editor
  const [notesDraft, setNotesDraft] = useState('');
  const [notesStatus, setNotesStatus] = useState<{ type: 'saving' | 'saved' | 'error'; message?: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    if (!user?.id) {
      if (!authLoading) {
        setIsLoading(false);
        setError(SIGNED_OUT_MESSAGE);
      }
      return;
    }
    const userId = user.id;
    let ignore = false;

    const loadProfileData = async () => {
      setIsLoading(true);
      setError(null);
      // Builds ?domain=business&user_id=123 context query string automatically
      const query = api.getContextQuery('business', userId);

      // The profile, transactions and appointments load independently so a missing list doesn't break the page
      const [clientRes, txnsRes, aptsRes] = await Promise.allSettled([
        api.fetchOne<unknown>('/api/binder/clients', id, query),
        api.fetchList<unknown>(`/api/binder/clients/${encodeURIComponent(id)}/transactions`, query),
        api.fetchList<unknown>(`/api/binder/clients/${encodeURIComponent(id)}/appointments`, query),
      ]);
      if (ignore) return;

      if (clientRes.status === 'fulfilled') {
        const record = toRecord<Client>(clientRes.value);
        setClient(record);
        setNotesDraft(record?.notes ?? '');
      } else {
        console.error('[ClientDetail] Fetch error:', clientRes.reason);
        setClient(null);
        setError(errorMessage(clientRes.reason, 'Could not load this client.'));
      }
      setTxns(toListState<Transaction>(txnsRes, 'transactions', 'Could not load transactions.'));
      setApts(toListState<Appointment>(aptsRes, 'appointments', 'Could not load appointments.'));
      setIsLoading(false);
    };

    loadProfileData();
    return () => { ignore = true; };
  }, [id, user?.id, authLoading, reloadKey]);

  const retry = user?.id ? () => setReloadKey(k => k + 1) : undefined;

  const saveNotes = async () => {
    if (!id || !user?.id || !client) return;
    setNotesStatus({ type: 'saving' });
    try {
      const query = api.getContextQuery('business', user.id);
      await api.updateEntity([`/api/binder/clients/${encodeURIComponent(id)}${query}`], {
        domain: 'business',
        user_id: user.id,
        patch: { notes: notesDraft },
      });
      setClient(prev => (prev ? { ...prev, notes: notesDraft } : prev));
      setNotesStatus({ type: 'saved' });
    } catch (err) {
      setNotesStatus({ type: 'error', message: errorMessage(err, 'Could not save notes.') });
    }
  };

  if (isLoading) {
    return (
      <BusinessLayout title="Client">
        <LoadingState label="Loading client..." padding="100px 0" />
      </BusinessLayout>
    );
  }

  if (error || !client) {
    return (
      <BusinessLayout title="Client Not Found">
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 0', textAlign: 'center' }}>
          {error ? <ErrorBanner message={error} onRetry={retry} /> : (
            <div style={{ fontSize: 16, color: 'var(--text-muted)', marginBottom: 16 }}>Client not found.</div>
          )}
          <button className="btn-primary btn-md" onClick={() => navigate(BUSINESS_ROUTES.CLIENTS)}>Back to Clients</button>
        </div>
      </BusinessLayout>
    );
  }

  const txnCols: Column<Transaction>[] = [
    { key: 'invoiceNumber', header: 'Invoice', render: v => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{String(v ?? '—')}</span> },
    { key: 'type', header: 'Type', render: v => <span style={{ fontSize: 12 }}>{v ? String(v) : '—'}</span> },
    { key: 'description', header: 'Description', render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v ? String(v) : '—'}</span> },
    {
      key: 'amount', header: 'Amount', align: 'right', sortable: true, render: v => (
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#22c55e', fontSize: 13 }}>{formatCurrency(v === undefined || v === null || v === '' ? null : toNumber(v))}</span>
      ),
    },
    { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
    { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(v, 'short')}</span> },
  ];

  const aptCols: Column<Appointment>[] = [
    { key: 'title', header: 'Title', render: v => <span style={{ fontSize: 13, fontWeight: 600 }}>{v ? String(v) : '—'}</span> },
    { key: 'date', header: 'Date', sortable: true, render: v => <span style={{ fontSize: 12 }}>{formatDate(v, 'short')}</span> },
    { key: 'time', header: 'Time', render: v => <span style={{ fontSize: 12 }}>{v ? String(v) : '—'}</span> },
    { key: 'hostName', header: 'Host', render: v => <span style={{ fontSize: 12 }}>{v ? String(v) : '—'}</span> },
    { key: 'status', header: 'Status', render: v => <Badge status={v as BadgeVariant} size="sm" /> },
  ];

  const notesDirty = notesDraft !== (client.notes ?? '');

  return (
    <BusinessLayout title={client.name || 'Client'}>
      <button
        className="btn-ghost btn-sm"
        onClick={() => navigate(BUSINESS_ROUTES.CLIENTS)}
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}
      >
        <ArrowLeft size={14} aria-hidden="true" /> Back to Clients
      </button>

      {/* Hero */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
            <Avatar name={client.name} size="xl" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4, overflowWrap: 'anywhere' }}>{client.name || '—'}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>
                {[client.company, client.industry].filter(Boolean).join(' · ') || '—'}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {client.plan && <PlanBadge plan={client.plan} />}
                <Badge status={client.status as BadgeVariant} />
              </div>
            </div>
          </div>
          <div className="biz-hero-stats">
            {[
              { label: 'Revenue YTD', value: formatCurrency(client.revenueYTD), color: '#22c55e' },
              { label: 'MRR', value: formatCurrency(client.mrr), color: 'var(--primary)' },
              { label: 'Since', value: formatDate(client.joinDate, 'short'), color: 'var(--text)' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 8px', border: '1px solid var(--border)', minWidth: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{stat.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: stat.color, fontFamily: 'var(--font-mono)', overflowWrap: 'anywhere' }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="biz-tabs" role="tablist" aria-label="Client sections">
        {TABS.map(t => (
          <button
            key={t}
            role="tab"
            id={`client-tab-${t}`}
            aria-selected={tab === t}
            aria-controls={`client-panel-${t}`}
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

      <div role="tabpanel" id={`client-panel-${tab}`} aria-labelledby={`client-tab-${tab}`}>
        {tab === 'Overview' && (
          <div className="two-col">
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Contact Info</div>
              {[
                { icon: <Mail size={14} />, label: 'Email', value: client.email || '—' },
                { icon: <Phone size={14} />, label: 'Phone', value: client.phone || '—' },
                { icon: <Globe size={14} />, label: 'Website', value: client.website || '—' },
                { icon: <MapPin size={14} />, label: 'Address', value: client.address || '—' },
                { icon: <Building2 size={14} />, label: 'Industry', value: client.industry || '—' },
                { icon: <Calendar size={14} />, label: 'Last Contact', value: formatDate(client.lastInteraction) },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <div style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }} aria-hidden="true">{icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', overflowWrap: 'anywhere' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Notes</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{client.notes || 'No notes yet.'}</p>
            </div>
          </div>
        )}

        {tab === 'Transactions' && (
          txns.error ? <ErrorBanner message={txns.error} onRetry={retry} /> : (
            <div className="card" style={{ padding: 0 }}>
              <DataTable
                data={txns.rows}
                columns={txnCols}
                rowKey="id"
                emptyTitle={txns.unavailable ? "Transaction history isn't available yet." : 'No transactions for this client.'}
              />
            </div>
          )
        )}

        {tab === 'Appointments' && (
          apts.error ? <ErrorBanner message={apts.error} onRetry={retry} /> : apts.unavailable ? (
            <div className="card">
              <UnavailableNotice icon={<Calendar size={28} />} title="Client appointment history isn't available yet">
                You can still see upcoming appointments on the Appointments page.
                <div style={{ marginTop: 16 }}>
                  <button type="button" className="btn-ghost btn-sm" onClick={() => navigate(BUSINESS_ROUTES.APPOINTMENTS)}>Open Appointments</button>
                </div>
              </UnavailableNotice>
            </div>
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <DataTable
                data={apts.rows}
                columns={aptCols}
                rowKey="id"
                emptyTitle="No appointments for this client."
              />
            </div>
          )
        )}

        {tab === 'Notes' && (
          <div className="card">
            <label className="card-title" htmlFor="client-notes" style={{ display: 'block', marginBottom: 16 }}>Client Notes</label>
            <textarea
              id="client-notes"
              className="form-input"
              style={{ minHeight: 200, resize: 'vertical', lineHeight: 1.6 }}
              value={notesDraft}
              onChange={e => { setNotesDraft(e.target.value); setNotesStatus(null); }}
              placeholder="Add notes about this client..."
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <button
                className="btn-primary btn-md"
                onClick={saveNotes}
                disabled={!notesDirty || notesStatus?.type === 'saving'}
              >
                {notesStatus?.type === 'saving' ? 'Saving...' : 'Save Notes'}
              </button>
              <span role="status" aria-live="polite" style={{ fontSize: 13 }}>
                {notesStatus?.type === 'saved' && <span style={{ color: 'var(--success)' }}>Notes saved.</span>}
                {notesStatus?.type === 'error' && <span style={{ color: 'var(--danger)' }}>{notesStatus.message}</span>}
              </span>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
