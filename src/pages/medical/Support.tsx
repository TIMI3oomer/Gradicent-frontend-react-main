import { MedicalLayout } from '../../layouts/MedicalLayout/MedicalLayout';
import { MessageCircle, Book, Mail } from 'lucide-react';

export function Support() {
  return (
    <MedicalLayout title="Support">
      <div style={{ maxWidth: 700 }}>
        <div className="three-col" style={{ marginBottom: 24 }}>
          {[
            { icon: <MessageCircle size={24} />, title: 'Live Chat', desc: 'Chat with our support team in real-time.', action: 'Start Chat', color: '#CE7A35' },
            { icon: <Book size={24} />, title: 'Documentation', desc: 'Browse our comprehensive knowledge base.', action: 'View Docs', color: '#78CEE6' },
            { icon: <Mail size={24} />, title: 'Email Support', desc: 'Send us an email and we\'ll get back to you within 24h.', action: 'Send Email', color: '#4CAF7D' },
          ].map(item => (
            <div key={item.title} className="card" style={{ textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: item.color + '20', color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                {item.icon}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontFamily: 'var(--font-lora)' }}>{item.title}</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.5 }}>{item.desc}</p>
              <button className="btn-primary btn-sm" style={{ width: '100%' }}>{item.action}</button>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Frequently Asked Questions</div>
          {[
            { q: 'How do I add a new patient?', a: 'Go to Patients → Add Patient, or click the "Add Patient" button in the top bar.' },
            { q: 'Can I export patient data?', a: 'Yes, visit Data Explorer to export records as CSV or PDF.' },
            { q: 'How is patient data secured?', a: 'All data is encrypted at rest and in transit. Gradicent is HIPAA compliant.' },
            { q: 'How do I reschedule an appointment?', a: 'Click on any appointment in the calendar to open the detail panel, then click Reschedule.' },
          ].map(faq => (
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
