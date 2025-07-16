import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import type { Role } from '@/utils/roles';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requiredRole?: Role;
  requireAuthentication?: boolean;
}

/**
 * ProtectedRoute - Wrapper component for route protection
 * Handles authentication and role-based access control
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAuthentication = true 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Show loading state while auth is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuthentication && !isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    // Additional role checks can be added here
    if (requiredRole === 'admin' && !user?.isAdmin) {
      return <Navigate to="/auth" replace />;
    }
    if (requiredRole === 'moderator' && !user?.isModerator && !user?.isAdmin) {
      return <Navigate to="/auth" replace />;
    }
  }

  // Render children if provided, otherwise render Outlet for nested routes
  return children ? <>{children}</> : <Outlet />;
}