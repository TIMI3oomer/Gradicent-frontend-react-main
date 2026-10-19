import { type ReactNode } from 'react';
import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { MessageCircle, Book, Mail } from 'lucide-react';

const SUPPORT_EMAIL = 'khaafif@gmail.com';

type SupportChannel = {
  icon: ReactNode;
  title: string;
  desc: string;
  action: string;
  color: string;
  href?: string;
};

const channels: SupportChannel[] = [
  { icon: <MessageCircle size={24} />, title: 'Live Chat', desc: 'Chat with our support team in real-time.', action: 'Start Chat', color: '#CE7A35' },
  { icon: <Book size={24} />, title: 'Documentation', desc: 'Browse our comprehensive knowledge base.', action: 'View Docs', color: '#78CEE6' },
  {
    icon: <Mail size={24} />,
    title: 'Email Support',
    desc: `Email ${SUPPORT_EMAIL} and we'll get back to you within 24h.`,
    action: 'Send Email',
    color: '#4CAF7D',
    href: `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Binder Software Medical support request')}`,
  },
];

const faqs = [
  { q: 'How do I add a new patient?', a: 'Go to Patients and click the "Add Patient" button in the top bar, then complete the three-step form.' },
  { q: 'Can I export patient data?', a: 'Yes. Open Data Explorer, optionally search to narrow the records, then click "Export CSV" to download the matching visits.' },
  { q: 'How is patient data secured?', a: 'All data is encrypted at rest and in transit. Binder Software is HIPAA compliant.' },
  { q: 'How do I manage appointments?', a: 'Open Appointments, pick a date, edit the name, phone or message on any open slot, then click "Save changes". Lock a slot to make it read-only.' },
];

export function Support() {
  return (
    <MedicalLayout title="Support">
      <div style={{ maxWidth: 700 }}>
        <div className="three-col" style={{ marginBottom: 24 }}>
          {channels.map(item => (
            <div key={item.title} className="card" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: item.color + '20', color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }} aria-hidden="true">
                {item.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-lora)' }}>{item.title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5, flex: 1, overflowWrap: 'anywhere' }}>{item.desc}</p>
              {item.href ? (
                <a
                  className="btn-primary btn-sm"
                  href={item.href}
                  style={{ display: 'block', width: '100%', textAlign: 'center' }}
                >
                  {item.action}
                </a>
              ) : (
                <button
                  className="btn-primary btn-sm"
                  style={{ width: '100%' }}
                  disabled
                  title="Coming soon"
                  aria-label={`${item.action} (coming soon)`}
                >
                  Coming soon
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Frequently Asked Questions</div>
          {faqs.map(faq => (
            <div key={faq.q} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{faq.q}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </MedicalLayout>
  );
}
