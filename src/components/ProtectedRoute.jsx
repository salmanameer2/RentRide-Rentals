import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * Route protection for Customer pages (/dashboard, /bookings, /profile)
 * Allows authenticated customers (role === 'customer' or default profile)
 * If unauthenticated -> redirects to /login preserving intended path
 * If role === 'admin' -> redirects to /admin/dashboard
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isAdmin, profile, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || profileLoading || (isAuthenticated && !profile)) {
    return <Loader message="Verifying driver credentials..." fullScreen />;
  }

  if (!isAuthenticated) {
    // Save intended internal destination path
    const targetPath = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(targetPath)}`} replace />;
  }

  // Admin accounts are routed to the administrative console
  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
