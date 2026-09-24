import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Car, CheckCircle2, Shield } from 'lucide-react';
import Container from '../components/Container';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signIn, isAuthenticated, isCustomer, isAdmin, loading, profileLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const urlError = queryParams.get('error');

  // Display error from URL query parameter if present
  useEffect(() => {
    if (urlError) {
      setError(urlError);
    }
  }, [urlError]);

  // Guest route protection: redirect if already authenticated
  useEffect(() => {
    if (!loading && !profileLoading && isAuthenticated) {
      if (isCustomer) {
        navigate('/', { replace: true });
      }
      // If isAdmin, we stay on /login (or could show a message), but we don't auto-redirect to admin dash
      // because /login is for customers.
    }
  }, [isAuthenticated, isCustomer, loading, profileLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await signIn({ email, password });
      setIsSubmitting(false);

      if (res.success) {
        navigate('/', { replace: true });
      } else {
        setError(res.error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Authentication service error. Please try again.');
    }
  };

  if (loading) {
    return <Loader message="Checking authentication status..." fullScreen />;
  }

  return (
    <div className="py-12 sm:py-20 bg-[#0b0f12] text-white flex items-center justify-center min-h-[calc(100vh-140px)]">
      <Container className="max-w-md w-full">
        <div className="bg-[#12181d] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Brand Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-[#bef264]">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Rent<span className="text-[#bef264]">Rides</span>
              </span>
            </Link>
            <h1 className="text-2xl font-extrabold text-white">Customer Sign In</h1>
            <p className="text-xs text-slate-400 mt-1">
              Sign in to access your rental reservations and driver dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
              <strong className="block font-semibold mb-0.5">Authentication Notice:</strong>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="customer-email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="customer-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="driver@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="customer-password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="customer-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              disabled={isSubmitting}
              className="w-full font-bold justify-center text-sm shadow-xl mt-2"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Footer Link to Signup */}
          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              className="text-[#bef264] hover:underline font-bold"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
