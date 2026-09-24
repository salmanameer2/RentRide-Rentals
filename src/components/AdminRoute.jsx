import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import Button from './Button';
import Loader from './Loader';

/**
 * Route protection foundation for Admin pages (/admin/*)
 * Requires:
 * 1. Authenticated session
 * 2. Database-backed profile loaded
 * 3. profile.role === 'admin'
 *
 * If unauthenticated -> redirects to /admin/login
 * If authenticated but profile.role !== 'admin' -> Denies access with 403 Forbidden screen
 */
export default function AdminRoute({ children }) {
  const { user, profile, isAuthenticated, isAdmin, loading, profileLoading, logout } = useAuth();
  const location = useLocation();

  // Auth or profile clearance in progress -> WAIT
  if (loading || profileLoading || (isAuthenticated && !profile)) {
    return <Loader message="Verifying administrative clearance..." fullScreen />;
  }

  // Not authenticated at all -> redirect to Admin Login portal
  if (!isAuthenticated) {
    const targetPath = location.pathname + location.search;
    return (
      <Navigate
        to={`/admin/login?redirect=${encodeURIComponent(targetPath)}`}
        replace
      />
    );
  }

  // Authenticated, but database clearance denies admin role
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#070a0c] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-3xl bg-[#11171d] border border-red-500/30 p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-red-400 mb-1">
              403 Forbidden
            </div>
            <h1 className="text-2xl font-black text-white">
              Administrative Access Denied
            </h1>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Your account (<strong className="text-slate-200">{user?.email}</strong>) has role <span className="text-amber-400 font-mono font-bold">"{profile?.role || 'customer'}"</span>. The Administrative Console is strictly restricted to authorized platform administrators.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="sm"
              to="/dashboard"
              className="flex-1 justify-center"
              icon={ArrowLeft}
              iconPosition="left"
            >
              Customer Portal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                await logout();
              }}
              to="/admin/login"
              className="flex-1 justify-center font-bold"
            >
              Sign In as Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
