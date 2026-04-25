import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import { queryClient } from './lib/queryClient';
import { MEDICAL_ROUTES } from './lib/constants';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

// Public
import { LandingPage } from './pages/public/LandingPage/LandingPage';
import { Login } from './pages/public/Login';
import { MedicalLanding } from './pages/public/MedicalLanding';
import { Products } from './pages/public/Products';
import { Privacy } from './pages/public/Privacy';
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
import { BUSINESS_ROUTES } from './lib/constants';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/medical-landing" element={<MedicalLanding />} />
                <Route path="/products" element={<Products />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Medical (protected) */}
                <Route path="/medical" element={<ProtectedRoute><Navigate to="/medical/home" replace /></ProtectedRoute>} />
                <Route path="/medical/home" element={<ProtectedRoute><MedicalHome /></ProtectedRoute>} />
                <Route path="/medical/patients" element={<ProtectedRoute><Patients /></ProtectedRoute>} />
                <Route path={MEDICAL_ROUTES.ADD_PATIENT} element={<ProtectedRoute><AddPatient /></ProtectedRoute>} />
                <Route path="/medical/patients/:id" element={<ProtectedRoute><PatientDetail /></ProtectedRoute>} />
                <Route path="/medical/appointments" element={<ProtectedRoute><MedicalAppointments /></ProtectedRoute>} />
                <Route path="/medical/stats" element={<ProtectedRoute><MedicalStats /></ProtectedRoute>} />
                <Route path="/medical/data" element={<ProtectedRoute><MedicalData /></ProtectedRoute>} />
                <Route path="/medical/notifications" element={<ProtectedRoute><MedicalNotifications /></ProtectedRoute>} />
                <Route path="/medical/settings" element={<ProtectedRoute><MedicalSettings /></ProtectedRoute>} />
                <Route path="/medical/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
                <Route path="/medical/account" element={<ProtectedRoute><MedicalAccount /></ProtectedRoute>} />

                {/* Business (protected) */}
                <Route path="/business" element={<ProtectedRoute><Navigate to="/business/home" replace /></ProtectedRoute>} />
                <Route path="/business/home" element={<ProtectedRoute><BusinessHome /></ProtectedRoute>} />
                <Route path="/business/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path={BUSINESS_ROUTES.CLIENTS_ADD} element={<ProtectedRoute><ClientRegistration domain="business" /></ProtectedRoute>} />
                <Route path="/business/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
                <Route path="/business/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                <Route path="/business/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
                <Route path="/business/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
                <Route path="/business/products" element={<ProtectedRoute><BusinessProducts /></ProtectedRoute>} />
                <Route path="/business/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
                <Route path="/business/appointments" element={<ProtectedRoute><BusinessAppointments /></ProtectedRoute>} />
                <Route path="/business/stats" element={<ProtectedRoute><BusinessStats /></ProtectedRoute>} />
                <Route path="/business/data" element={<ProtectedRoute><BusinessData /></ProtectedRoute>} />
                <Route path="/business/notifications" element={<ProtectedRoute><BusinessNotifications /></ProtectedRoute>} />
                <Route path="/business/settings" element={<ProtectedRoute><BusinessSettings /></ProtectedRoute>} />
                <Route path="/business/account" element={<ProtectedRoute><BusinessAccount /></ProtectedRoute>} />
                <Route path="/business/plan" element={<ProtectedRoute><Plan /></ProtectedRoute>} />

                {/* 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
