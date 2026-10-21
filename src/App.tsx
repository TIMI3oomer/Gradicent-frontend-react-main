import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { queryClient } from './lib/queryClient';
import { APP_NAME, MEDICAL_ROUTES, BUSINESS_ROUTES } from './lib/constants';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { AppErrorBoundary, loadPage } from './components/shared/AppErrorBoundary';
import { LoadingState } from './components/shared/PageStatus';

// Public (the landing and sign-in pages load with the app; everything else on demand)
import { LandingPage } from './pages/public/LandingPage/LandingPage';
import { Login } from './pages/public/Login';
import { NotFound } from './pages/public/NotFound';
const MedicalLanding = lazy(() => loadPage(() => import('./pages/public/MedicalLanding')).then(m => ({ default: m.MedicalLanding })));
const Products = lazy(() => loadPage(() => import('./pages/public/Products')).then(m => ({ default: m.Products })));
const Privacy = lazy(() => loadPage(() => import('./pages/public/Privacy')).then(m => ({ default: m.Privacy })));
const Terms = lazy(() => loadPage(() => import('./pages/public/Terms')).then(m => ({ default: m.Terms })));

// Medical
const MedicalHome = lazy(() => loadPage(() => import('./pages/medical/MedicalHome')).then(m => ({ default: m.MedicalHome })));
const Patients = lazy(() => loadPage(() => import('./pages/medical/Patients')).then(m => ({ default: m.Patients })));
const PatientDetail = lazy(() => loadPage(() => import('./pages/medical/PatientDetail')).then(m => ({ default: m.PatientDetail })));
const AddPatient = lazy(() => loadPage(() => import('./pages/medical/AddPatient')).then(m => ({ default: m.AddPatient })));
const MedicalAppointments = lazy(() => loadPage(() => import('./pages/medical/MedicalAppointments')).then(m => ({ default: m.MedicalAppointments })));
const MedicalStats = lazy(() => loadPage(() => import('./pages/medical/MedicalStats')).then(m => ({ default: m.MedicalStats })));
const MedicalData = lazy(() => loadPage(() => import('./pages/medical/MedicalData')).then(m => ({ default: m.MedicalData })));
const MedicalSettings = lazy(() => loadPage(() => import('./pages/medical/MedicalSettings')).then(m => ({ default: m.MedicalSettings })));
const MedicalNotifications = lazy(() => loadPage(() => import('./pages/medical/MedicalNotifications')).then(m => ({ default: m.MedicalNotifications })));
const Support = lazy(() => loadPage(() => import('./pages/medical/Support')).then(m => ({ default: m.Support })));
const MedicalAccount = lazy(() => loadPage(() => import('./pages/medical/MedicalAccount')).then(m => ({ default: m.MedicalAccount })));

// Business
const BusinessHome = lazy(() => loadPage(() => import('./pages/business/BusinessHome')).then(m => ({ default: m.BusinessHome })));
const Clients = lazy(() => loadPage(() => import('./pages/business/Clients')).then(m => ({ default: m.Clients })));
const ClientRegistration = lazy(() => loadPage(() => import('./pages/shared/ClientRegistration')).then(m => ({ default: m.ClientRegistration })));
const ClientDetail = lazy(() => loadPage(() => import('./pages/business/ClientDetail')).then(m => ({ default: m.ClientDetail })));
const Employees = lazy(() => loadPage(() => import('./pages/business/Employees')).then(m => ({ default: m.Employees })));
const EmployeeDetail = lazy(() => loadPage(() => import('./pages/business/EmployeeDetail')).then(m => ({ default: m.EmployeeDetail })));
const Transactions = lazy(() => loadPage(() => import('./pages/business/Transactions')).then(m => ({ default: m.Transactions })));
const BusinessProducts = lazy(() => loadPage(() => import('./pages/business/BusinessProducts')).then(m => ({ default: m.BusinessProducts })));
const Services = lazy(() => loadPage(() => import('./pages/business/Services')).then(m => ({ default: m.Services })));
const BusinessAppointments = lazy(() => loadPage(() => import('./pages/business/BusinessAppointments')).then(m => ({ default: m.BusinessAppointments })));
const BusinessStats = lazy(() => loadPage(() => import('./pages/business/BusinessStats')).then(m => ({ default: m.BusinessStats })));
const BusinessData = lazy(() => loadPage(() => import('./pages/business/BusinessData')).then(m => ({ default: m.BusinessData })));
const BusinessSettings = lazy(() => loadPage(() => import('./pages/business/BusinessSettings')).then(m => ({ default: m.BusinessSettings })));
const BusinessAccount = lazy(() => loadPage(() => import('./pages/business/BusinessAccount')).then(m => ({ default: m.BusinessAccount })));
const Plan = lazy(() => loadPage(() => import('./pages/business/Plan')).then(m => ({ default: m.Plan })));
const BusinessNotifications = lazy(() => loadPage(() => import('./pages/business/BusinessNotifications')).then(m => ({ default: m.BusinessNotifications })));

// ─── Reset scroll on navigation (or jump to #hash targets) ────────────────────

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }

    // The target may not be mounted yet while the previous route animates out
    let attempts = 0;
    const timer = window.setInterval(() => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target || ++attempts > 20) {
        window.clearInterval(timer);
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);

  return null;
}

// ─── Per-page browser tab titles ──────────────────────────────────────────────

const PAGE_TITLES: [RegExp, string][] = [
  [/^\/$/, ''],
  [/^\/login/, 'Sign in'],
  [/^\/products/, 'Pricing'],
  [/^\/medical-landing/, 'Medical'],
  [/^\/privacy/, 'Privacy Policy'],
  [/^\/terms/, 'Terms of Service'],
  [/^\/medical\/home/, 'Medical Dashboard'],
  [/^\/medical\/patients\/add/, 'Add Patient'],
  [/^\/medical\/patients\/[^/]+/, 'Patient'],
  [/^\/medical\/patients/, 'Patients'],
  [/^\/medical\/appointments/, 'Appointments'],
  [/^\/medical\/stats/, 'Analytics'],
  [/^\/medical\/data/, 'Data'],
  [/^\/medical\/notifications/, 'Notifications'],
  [/^\/medical\/settings/, 'Settings'],
  [/^\/medical\/support/, 'Support'],
  [/^\/medical\/account/, 'Account'],
  [/^\/business\/home/, 'Business Dashboard'],
  [/^\/business\/clients\/add/, 'Add Client'],
  [/^\/business\/clients\/[^/]+/, 'Client'],
  [/^\/business\/clients/, 'Clients'],
  [/^\/business\/employees\/[^/]+/, 'Employee'],
  [/^\/business\/employees/, 'Employees'],
  [/^\/business\/transactions/, 'Transactions'],
  [/^\/business\/products/, 'Products'],
  [/^\/business\/services/, 'Services'],
  [/^\/business\/appointments/, 'Appointments'],
  [/^\/business\/stats/, 'Analytics'],
  [/^\/business\/data/, 'Data'],
  [/^\/business\/notifications/, 'Notifications'],
  [/^\/business\/settings/, 'Settings'],
  [/^\/business\/account/, 'Account'],
  [/^\/business\/plan/, 'Plan'],
];

function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const match = PAGE_TITLES.find(([pattern]) => pattern.test(pathname));
    const page = match ? match[1] : 'Page Not Found';
    document.title = page ? `${page} · ${APP_NAME}` : APP_NAME;
  }, [pathname]);

  return null;
}

// ─── AnimatePresence needs a keyed child to detect route changes ──────────────

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense key={location.pathname} fallback={<LoadingState label="Loading..." padding="30vh 0" />}>
      <Routes location={location}>

        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/medical-landing" element={<MedicalLanding />} />
        <Route path="/products" element={<Products />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* ── Medical (protected) — layout route guards the whole subtree ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/medical" element={<Navigate to="/medical/home" replace />} />
          <Route path="/medical/home" element={<MedicalHome />} />
          <Route path="/medical/patients" element={<Patients />} />
          <Route path={MEDICAL_ROUTES.ADD_PATIENT} element={<AddPatient />} />
          <Route path="/medical/patients/:id" element={<PatientDetail />} />
          <Route path="/medical/appointments" element={<MedicalAppointments />} />
          <Route path="/medical/stats" element={<MedicalStats />} />
          <Route path="/medical/data" element={<MedicalData />} />
          <Route path="/medical/notifications" element={<MedicalNotifications />} />
          <Route path="/medical/settings" element={<MedicalSettings />} />
          <Route path="/medical/support" element={<Support />} />
          <Route path="/medical/account" element={<MedicalAccount />} />
        </Route>

        {/* ── Business (protected) — same pattern ── */}
        <Route element={<ProtectedRoute />}>
          <Route path="/business" element={<Navigate to="/business/home" replace />} />
          <Route path="/business/home" element={<BusinessHome />} />
          <Route path="/business/clients" element={<Clients />} />
          <Route path={BUSINESS_ROUTES.CLIENTS_ADD} element={<ClientRegistration domain="business" />} />
          <Route path="/business/clients/:id" element={<ClientDetail />} />
          <Route path="/business/employees" element={<Employees />} />
          <Route path="/business/employees/:id" element={<EmployeeDetail />} />
          <Route path="/business/transactions" element={<Transactions />} />
          <Route path="/business/products" element={<BusinessProducts />} />
          <Route path="/business/services" element={<Services />} />
          <Route path="/business/appointments" element={<BusinessAppointments />} />
          <Route path="/business/stats" element={<BusinessStats />} />
          <Route path="/business/data" element={<BusinessData />} />
          <Route path="/business/notifications" element={<BusinessNotifications />} />
          <Route path="/business/settings" element={<BusinessSettings />} />
          <Route path="/business/account" element={<BusinessAccount />} />
          <Route path="/business/plan" element={<Plan />} />
        </Route>

        {/* ── 404 ── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <ScrollManager />
            <DocumentTitle />
            <AppErrorBoundary>
              <AnimatedRoutes />
            </AppErrorBoundary>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
