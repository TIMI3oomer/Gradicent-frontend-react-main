import type { Product } from '../types';

export const mockProducts: Product[] = [
  {
    id: 'PRD-001', name: 'Gradicent Business Pro', description: 'Full-featured business operations platform',
    category: 'Subscription', price: 899, unit: 'per month', status: 'Active', sku: 'GRD-BIZ-PRO',
    inventory: null, tags: ['SaaS', 'Core Product'],
    createdAt: '2021-01-01', updatedAt: '2024-10-01',
  },
  {
    id: 'PRD-002', name: 'Gradicent Business Enterprise', description: 'Enterprise tier with SLA and custom CSM',
    category: 'Subscription', price: 2800, unit: 'per month', status: 'Active', sku: 'GRD-BIZ-ENT',
    inventory: null, tags: ['SaaS', 'Enterprise', 'Core Product'],
    createdAt: '2021-01-01', updatedAt: '2024-10-01',
  },
  {
    id: 'PRD-003', name: 'Gradicent Business Basic', description: 'Entry-level plan for small teams',
    category: 'Subscription', price: 249, unit: 'per month', status: 'Active', sku: 'GRD-BIZ-BSC',
    inventory: null, tags: ['SaaS', 'Core Product', 'SMB'],
    createdAt: '2021-01-01', updatedAt: '2024-10-01',
  },
  {
    id: 'PRD-004', name: 'Implementation Package - Standard', description: 'Complete setup and onboarding service',
    category: 'Professional Services', price: 4500, unit: 'one-time', status: 'Active', sku: 'SVC-IMPL-STD',
    inventory: null, tags: ['Services', 'Onboarding'],
    createdAt: '2022-03-15', updatedAt: '2024-08-01',
  },
  {
    id: 'PRD-005', name: 'Implementation Package - Enterprise', description: 'White-glove enterprise implementation',
    category: 'Professional Services', price: 18000, unit: 'one-time', status: 'Active', sku: 'SVC-IMPL-ENT',
    inventory: null, tags: ['Services', 'Enterprise', 'Onboarding'],
    createdAt: '2022-03-15', updatedAt: '2024-08-01',
  },
  {
    id: 'PRD-006', name: 'Data Migration Service', description: 'Secure migration from legacy systems',
    category: 'Professional Services', price: 2800, unit: 'one-time', status: 'Active', sku: 'SVC-MIG-STD',
    inventory: null, tags: ['Services', 'Data'],
    createdAt: '2022-06-01', updatedAt: '2024-09-15',
  },
  {
    id: 'PRD-007', name: 'Training Workshop (per session)', description: 'On-site or remote training session',
    category: 'Training', price: 1200, unit: 'per session', status: 'Active', sku: 'TRN-WKSP-001',
    inventory: null, tags: ['Training', 'Services'],
    createdAt: '2022-01-10', updatedAt: '2024-07-01',
  },
  {
    id: 'PRD-008', name: 'API Access - Extended Rate', description: 'Increased API rate limit add-on',
    category: 'Add-on', price: 199, unit: 'per month', status: 'Active', sku: 'ADD-API-EXT',
    inventory: null, tags: ['Add-on', 'API'],
    createdAt: '2023-01-01', updatedAt: '2024-10-01',
  },
  {
    id: 'PRD-009', name: 'Additional User Seats (5-pack)', description: 'Add 5 more user seats to any plan',
    category: 'Add-on', price: 150, unit: 'per month', status: 'Active', sku: 'ADD-SEAT-5PK',
    inventory: null, tags: ['Add-on', 'Seats'],
    createdAt: '2023-03-01', updatedAt: '2024-10-01',
  },
  {
    id: 'PRD-010', name: 'Advanced Analytics Module', description: 'Custom reporting and advanced BI tools',
    category: 'Add-on', price: 399, unit: 'per month', status: 'Active', sku: 'ADD-ANA-ADV',
    inventory: null, tags: ['Add-on', 'Analytics'],
    createdAt: '2023-06-15', updatedAt: '2024-11-01',
  },
  {
    id: 'PRD-011', name: 'Legacy Integration Bridge', description: 'Connect to legacy ERPs (deprecated)',
    category: 'Add-on', price: 299, unit: 'per month', status: 'Discontinued', sku: 'ADD-LEGCY-INT',
    inventory: null, tags: ['Add-on', 'Legacy'],
    createdAt: '2021-09-01', updatedAt: '2024-06-01',
  },
  {
    id: 'PRD-012', name: 'Dedicated Success Manager', description: 'Dedicated CSM for high-touch accounts',
    category: 'Service Tier', price: 1500, unit: 'per month', status: 'Draft', sku: 'SVC-DSM-001',
    inventory: null, tags: ['Services', 'Enterprise', 'CSM'],
    createdAt: '2024-11-01', updatedAt: '2024-11-01',
  },
];
