import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { queryClient } from './lib/queryClient';
import { MEDICAL_ROUTES, BUSINESS_ROUTES } from './lib/constants';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Public
import { LandingPage } from './pages/public/LandingPage/LandingPage';
import { Login } from './pages/public/Login';
import { MedicalLanding } from './pages/public/MedicalLanding';
import { Products } from './pages/public/Products';
import { Privacy } from './pages/public/Privacy';
import { AuthCallback } from './pages/public/AuthCallback';
import { Terms } from './pages/public/Terms';
import { NotFound } from './pages/public/NotFound';

// Medical
import { MedicalHome } from './pages/medical/MedicalHome';
import { Patients } from './pages/medical/Patients';
import { PatientDetail } from './pages/medical/PatientDetail';
import { AddPatient } from './pages/medical/AddPatient';
import { MedicalAppointments } from './pages/medical/MedicalAppointments';
import { MedicalStats } from './pages/medical/MedicalStats';
import { MedicalData } from './pages/medical/MedicalData';
import { MedicalSettings } from './pages/medical/MedicalSettings';
import { MedicalNotifications } from './pages/medical/MedicalNotifications';
import { Support } from './pages/medical/Support';
import { MedicalAccount } from './pages/medical/MedicalAccount';

// Business
import { BusinessHome } from './pages/business/BusinessHome';
import { Clients } from './pages/business/Clients';
import { ClientRegistration } from './pages/shared/ClientRegistration';
import { ClientDetail } from './pages/business/ClientDetail';
import { Employees } from './pages/business/Employees';
import { EmployeeDetail } from './pages/business/EmployeeDetail';
import { Transactions } from './pages/business/Transactions';
import { BusinessProducts } from './pages/business/BusinessProducts';
import { Services } from './pages/business/Services';
import { BusinessAppointments } from './pages/business/BusinessAppointments';
import { BusinessStats } from './pages/business/BusinessStats';
import { BusinessData } from './pages/business/BusinessData';
import { BusinessSettings } from './pages/business/BusinessSettings';
import { BusinessAccount } from './pages/business/BusinessAccount';
import { Plan } from './pages/business/Plan';
import { BusinessNotifications } from './pages/business/BusinessNotifications';

// ─── AnimatePresence needs a keyed child to detect route changes ──────────────

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* ── Public ── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
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
            <AnimatedRoutes />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
