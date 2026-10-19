export const APP_NAME = 'Binder Software';
export const DEV_TOKEN = 'dev-token-binder-software';
export const DEV_MODE = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const MEDICAL_ROUTES = {
  HOME: '/medical/home',
  PATIENTS: '/medical/patients',
  PATIENT_DETAIL: '/medical/patients/:id',
  ADD_PATIENT: '/medical/patients/add',
  APPOINTMENTS: '/medical/appointments',
  STATS: '/medical/stats',
  DATA: '/medical/data',
  SETTINGS: '/medical/settings',
  SUPPORT: '/medical/support',
  ACCOUNT: '/medical/account',
  NOTIFICATIONS: '/medical/notifications',
} as const;

export const BUSINESS_ROUTES = {
  HOME: '/business/home',
  CLIENTS: '/business/clients',
  CLIENTS_ADD: '/business/clients/add',
  CLIENT_DETAIL: '/business/clients/:id',
  PRODUCTS: '/business/products',
  SERVICES: '/business/services',
  EMPLOYEES: '/business/employees',
  EMPLOYEE_DETAIL: '/business/employees/:id',
  TRANSACTIONS: '/business/transactions',
  APPOINTMENTS: '/business/appointments',
  STATS: '/business/stats',
  DATA: '/business/data',
  SETTINGS: '/business/settings',
  ACCOUNT: '/business/account',
  PLAN: '/business/plan',
  NOTIFICATIONS: '/business/notifications',
} as const;
