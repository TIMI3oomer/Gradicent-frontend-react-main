import type { Notification } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: 'NOT-001', type: 'warning', domain: 'medical', title: 'High-Risk Patient Alert',
    message: 'Rosa Martinez has reported chest pain. Urgent follow-up required.',
    read: false, createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    link: '/medical/patients',
  },
  {
    id: 'NOT-002', type: 'success', domain: 'business', title: 'Payment Received',
    message: 'Whitfield Capital payment of $5,500 has been received.',
    read: false, createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    link: '/business/transactions',
  },
  {
    id: 'NOT-003', type: 'info', domain: 'medical', title: 'New Patient Registered',
    message: 'Kevin Nguyen (PAT-014) has completed registration.',
    read: false, createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    link: '/medical/patients',
  },
  {
    id: 'NOT-004', type: 'error', domain: 'business', title: 'Payment Failed',
    message: 'Herrera Construction subscription payment failed. Card declined.',
    read: false, createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    link: '/business/transactions',
  },
  {
    id: 'NOT-005', type: 'info', domain: 'business', title: 'New Client Lead',
    message: 'Kim Beauty Labs has signed up for a free trial.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    link: '/business/clients',
  },
  {
    id: 'NOT-006', type: 'success', domain: 'medical', title: 'Appointment Completed',
    message: 'Patricia Thompson\'s check-up has been marked as completed.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    link: '/medical/appointments',
  },
  {
    id: 'NOT-007', type: 'warning', domain: 'business', title: 'Invoice Overdue',
    message: 'Invoice INV-2024-0508 for Bloom Retail Group is due in 2 days.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    link: '/business/transactions',
  },
  {
    id: 'NOT-008', type: 'info', domain: 'system', title: 'System Update Available',
    message: 'Binder Software v2.5 is available. New features: Enhanced reporting, dark mode improvements.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: null,
  },
  {
    id: 'NOT-009', type: 'success', domain: 'business', title: 'Deal Closed',
    message: 'Jordan Blake closed a 2-year renewal with Stafford Logistics.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    link: '/business/clients',
  },
  {
    id: 'NOT-010', type: 'info', domain: 'medical', title: 'Appointment Reminder',
    message: 'David Kim\'s cardiac stress test is scheduled for tomorrow at 11:00 AM.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    link: '/medical/appointments',
  },
  {
    id: 'NOT-011', type: 'warning', domain: 'medical', title: 'Medication Review Due',
    message: 'Mei-Ling Zhang is due for her quarterly medication review.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    link: '/medical/patients',
  },
  {
    id: 'NOT-012', type: 'error', domain: 'system', title: 'Integration Sync Failed',
    message: 'The CRM sync with Salesforce failed. Please check integration settings.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
    link: '/business/settings',
  },
  {
    id: 'NOT-013', type: 'success', domain: 'business', title: 'Enterprise Upgrade',
    message: 'Mason & Associates has upgraded from Pro to Enterprise plan.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    link: '/business/clients',
  },
  {
    id: 'NOT-014', type: 'info', domain: 'medical', title: 'Lab Results Ready',
    message: 'Blood work results for Marcus Williams are now available.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    link: '/medical/patients',
  },
  {
    id: 'NOT-015', type: 'info', domain: 'system', title: 'Weekly Summary',
    message: 'Your weekly report is ready: 47 patient visits, $38,200 in revenue.',
    read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    link: null,
  },
];
