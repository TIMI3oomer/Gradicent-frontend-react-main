// components/shared/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // or a <PageSpinner />

  return isAuthenticated
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
