import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: Array<'admin' | 'customer' | 'landscaper'>;
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.user_role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}