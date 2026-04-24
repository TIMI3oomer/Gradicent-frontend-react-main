import type { Service } from '../types';

export const mockServices: Service[] = [
  {
    id: 'SVC-001', name: 'Business Intelligence Suite', description: 'Real-time dashboards and analytics',
    category: 'Analytics', basePrice: 299, billingType: 'Recurring',
    status: 'Active', clientCount: 42, revenueYTD: 38640, icon: 'chart-bar',
  },
  {
    id: 'SVC-002', name: 'CRM Integration', description: 'Sync with Salesforce, HubSpot, and more',
    category: 'Integrations', basePrice: 149, billingType: 'Recurring',
    status: 'Active', clientCount: 38, revenueYTD: 28728, icon: 'arrow-left-right',
  },
  {
    id: 'SVC-003', name: 'Enterprise Consulting', description: 'Strategic operations consulting',
    category: 'Professional Services', basePrice: 12000, billingType: 'One-time',
    status: 'Active', clientCount: 9, revenueYTD: 89000, icon: 'briefcase',
  },
  {
    id: 'SVC-004', name: 'Financial Operations Module', description: 'Invoicing, billing, and expense tracking',
    category: 'Finance', basePrice: 199, billingType: 'Recurring',
    status: 'Active', clientCount: 31, revenueYTD: 25388, icon: 'currency-dollar',
  },
  {
    id: 'SVC-005', name: 'HR & Workforce Management', description: 'Employee scheduling and performance tools',
    category: 'HR', basePrice: 179, billingType: 'Recurring',
    status: 'Active', clientCount: 24, revenueYTD: 18072, icon: 'users',
  },
  {
    id: 'SVC-006', name: 'API Developer Access', description: 'Full REST API access with documentation',
    category: 'Developer', basePrice: 99, billingType: 'Recurring',
    status: 'Active', clientCount: 19, revenueYTD: 9108, icon: 'code',
  },
  {
    id: 'SVC-007', name: 'White-label Portal', description: 'Branded client portal for your customers',
    category: 'Customization', basePrice: 499, billingType: 'Recurring',
    status: 'Active', clientCount: 7, revenueYTD: 19960, icon: 'paint-bucket',
  },
  {
    id: 'SVC-008', name: 'Legacy System Migration', description: 'One-time data migration service',
    category: 'Professional Services', basePrice: 3500, billingType: 'One-time',
    status: 'Inactive', clientCount: 0, revenueYTD: 14850, icon: 'database',
  },
];
