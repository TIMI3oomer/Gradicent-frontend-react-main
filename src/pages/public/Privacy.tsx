import { PublicLayout } from '../../layouts/PublicLayout/PublicLayout';

export function Privacy() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>Privacy Policy</h1>
        <p style={{ color: '#6b7280', marginBottom: 40 }}>Last updated: November 1, 2024</p>

        {[
          {
            title: '1. Information We Collect',
            body: 'We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes name, email address, phone number, payment information, and any other information you choose to provide.',
          },
          {
            title: '2. How We Use Your Information',
            body: 'We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, respond to your comments and questions, and send you marketing communications (with your consent).',
          },
          {
            title: '3. Information Sharing',
            body: 'We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with vendors, consultants, and other service providers who need access to such information to carry out work on our behalf.',
          },
          {
            title: '4. Data Security',
            body: 'We implement appropriate technical and organizational security measures to protect your personal information against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access. All data is encrypted at rest and in transit using industry-standard protocols.',
          },
          {
            title: '5. HIPAA Compliance',
            body: 'For our medical customers, Binder Software is fully HIPAA compliant. We maintain Business Associate Agreements (BAAs) with all applicable customers and ensure all Protected Health Information (PHI) is handled in accordance with HIPAA regulations.',
          },
          {
            title: '6. Your Rights',
            body: 'You have the right to access, update, or delete your personal information. You may also opt out of marketing communications at any time. To exercise these rights, please contact us at khaafif@gmail.com.',
          },
          {
            title: '7. Contact Us',
            body: 'If you have questions about this Privacy Policy, please contact us at khaafif@gmail.com.',
          },
        ].map(section => (
          <div key={section.title} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>{section.title}</h2>
            <p style={{ color: '#374151', lineHeight: 1.8, fontSize: 15 }}>{section.body}</p>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
