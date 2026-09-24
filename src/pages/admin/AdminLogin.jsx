import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Loader from '../../components/Loader';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { adminLogin, isAuthenticated, isAdmin, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const rawRedirect = queryParams.get('redirect');
  const urlError = queryParams.get('error');

  const safeRedirectPath = (rawRedirect && rawRedirect.startsWith('/admin') && !rawRedirect.startsWith('//'))
    ? rawRedirect
    : '/admin/dashboard';

  // Display error from URL query parameter if present
  useEffect(() => {
    if (urlError) {
      setError(urlError);
    }
  }, [urlError]);

  // If already logged in as admin, redirect directly into the console
  useEffect(() => {
    if (!loading && !profileLoading && isAuthenticated && isAdmin) {
      navigate(safeRedirectPath, { replace: true });
    }
  }, [isAuthenticated, isAdmin, loading, profileLoading, navigate, safeRedirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both administrator credentials.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await adminLogin({ email, password });
      setIsSubmitting(false);

      if (res.success) {
        navigate(safeRedirectPath, { replace: true });
      } else {
        setError(res.error || 'Invalid administrator credentials or clearance denied.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Administrative authentication service failure.');
    }
  };

  if (loading || profileLoading) {
    return <Loader message="Verifying security environment..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-[#070a0c] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Subtle Mesh / Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

      {/* Main Admin Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-[#0f1419] border border-slate-800/90 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#182128] border border-slate-700 text-[#bef264] mb-2 shadow-inner">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-xl font-black text-white tracking-tight">
                Rent<span className="text-[#bef264]">Rides</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20">
                Admin Portal
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Internal Operations Console
            </h1>
            <p className="text-xs text-slate-400">
              Restricted system for fleet dispatchers and executive administrators.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200 flex items-start gap-2">
              <span className="font-bold">Access Denied:</span> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-[#151c22] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264] font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Admin Clearance Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#151c22] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264] font-mono text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full font-bold justify-center text-sm shadow-xl mt-2 bg-[#bef264] text-black hover:bg-[#aee64b]"
            >
              {isSubmitting ? 'Verifying Clearance...' : 'Authenticate & Enter Console'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
