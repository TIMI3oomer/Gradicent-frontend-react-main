// Gradicent Shared Types

export interface Patient {
  id: string;
  name: string;
  dob: string;
  age: number;
  gender: 'M' | 'F' | 'Other';
  email: string;
  phone: string;
  address: string;
  primaryCondition: string;
  secondaryConditions: string[];
  allergies: string[];
  medications: string[];
  lastVisit: string;
  nextAppointment: string | null;
  status: 'Active' | 'Discharged' | 'Pending';
  doctor: string;
  notes: string;
  insuranceProvider: string;
  policyNumber: string;
  totalVisits: number;
  emergencyContact: { name: string; phone: string; relation: string };
  createdAt: string;
}

export interface Client {
  avatar: string;
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  plan: 'Basic' | 'Pro' | 'Enterprise';
  mrr: number;
  revenueYTD: number;
  status: 'Active' | 'Churned' | 'Lead';
  joinDate: string;
  lastInteraction: string;
  assignedEmployee: string;
  tags: string[];
  address: string;
  industry: string;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  salary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
  avatar: string;
  manager: string | null;
  location: string;
  bio: string;
  skills: string[];
  weeklyHours: number;
  performanceScore: number;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  type: 'Invoice' | 'Payment' | 'Refund' | 'Subscription';
  status: 'Paid' | 'Pending' | 'Failed' | 'Cancelled';
  date: string;
  dueDate: string | null;
  description: string;
  reference: string;
  invoiceNumber: string | null;
  notes: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  type: 'Medical' | 'Business';
  appointmentType: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled' | 'No-show';
  attendeeId: string;
  attendeeName: string;
  hostName: string;
  location: string;
  notes: string;
  colorCode: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  status: 'Active' | 'Discontinued' | 'Draft';
  sku: string;
  inventory: number | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  billingType: 'Recurring' | 'One-time' | 'Usage-based';
  status: 'Active' | 'Inactive';
  clientCount: number;
  revenueYTD: number;
  icon: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  domain: 'medical' | 'business' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'medical' | 'business' | 'both';
  plan: 'Basic' | 'Pro' | 'Enterprise';
  specialty?: string;
  licenseNumber?: string;
}

export interface MedicalStats {
  totalPatients: number;
  newPatientsThisMonth: number;
  visitsToday: number;
  visitsScheduledToday: number;
  appointmentsToday: number;
  avgWaitTime: number;
  avgVisitDuration: number;
  patientSatisfaction: number;
  topConditions: { condition: string; count: number; percentage: number }[];
  visitsByMonth: { month: string; visits: number }[];
  visitsByType: { type: string; count: number; percentage: number }[];
  doctorPerformance: { name: string; patients: number; visits: number; satisfaction: number; avgDuration: number }[];
  ageDistribution: { range: string; count: number }[];
  genderDistribution: { gender: string; count: number; percentage: number }[];
}

export interface BusinessStats {
  totalRevenueYTD: number;
  revenueThisMonth: number;
  lastMonthRevenue: number;
  activeClients: number;
  newClientsThisMonth: number;
  churnRate: number;
  previousChurnRate: number;
  roi: number;
  previousRoi: number;
  employeeCount: number;
  topServices: { service: string; revenue: number; percentage: number }[];
  revenueByMonth: { month: string; revenue: number; prevYear: number }[];
  clientsByPlan: { plan: string; count: number; percentage: number }[];
  employeeProductivity: { name: string; deals: number; revenue: number; satisfaction: number; completion: number }[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}
