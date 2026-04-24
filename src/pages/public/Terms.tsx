import { PublicLayout } from '../../layouts/PublicLayout/PublicLayout';

export function Terms() {
  return (
    <PublicLayout>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '64px 24px' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 40, fontWeight: 800, color: 'var(--navy)', marginBottom: 8 }}>Terms of Service</h1>
        <p style={{ color: '#6b7280', marginBottom: 40 }}>Last updated: November 1, 2024</p>

        {[
          {
            title: '1. Acceptance of Terms',
            body: 'By accessing and using Gradicent services, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to abide by the above, please do not use this service.',
          },
          {
            title: '2. Use License',
            body: 'Permission is granted to temporarily access and use Gradicent\'s services for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not modify or copy the materials; use the materials for any commercial purpose; attempt to decompile or reverse engineer any software contained in the service.',
          },
          {
            title: '3. Service Availability',
            body: 'Gradicent provides services on an "as is" basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property. We provide 99.9% uptime SLA for Enterprise customers.',
          },
          {
            title: '4. Account Responsibilities',
            body: 'You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password. You must notify Gradicent immediately upon becoming aware of any breach of security.',
          },
          {
            title: '5. Billing and Payments',
            body: 'Subscription fees are billed in advance on a monthly or annual basis. All payments are non-refundable except as required by law. We reserve the right to change our pricing with 30 days notice to existing customers. If you cancel your subscription, you will continue to have access until the end of your billing period.',
          },
          {
            title: '6. Termination',
            body: 'Gradicent may terminate or suspend your account immediately, without prior notice, for conduct that Gradicent believes violates these Terms of Service or is harmful to other users, Gradicent, or third parties, or for any other reason.',
          },
          {
            title: '7. Governing Law',
            body: 'These terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of San Francisco County, California.',
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
