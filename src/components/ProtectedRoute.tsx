import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../lib/useRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireSubscription?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireSubscription = false
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const { isAdmin, isSubscriber } = useRole();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in — send to login
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  // Admin check
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Subscription check — but admins always pass
  if (requireSubscription && !isAdmin && !isSubscriber) {
    return <Navigate to="/memberships" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
