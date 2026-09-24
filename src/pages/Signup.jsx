import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Car, CheckCircle2 } from 'lucide-react';
import Container from '../components/Container';
import Button from '../components/Button';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signUp, isAuthenticated, isCustomer, isAdmin, loading, profileLoading } = useAuth();
  const navigate = useNavigate();

  // Guest route protection: redirect if already authenticated
  useEffect(() => {
    if (!loading && !profileLoading && isAuthenticated) {
      if (isCustomer) {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, isCustomer, loading, profileLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessInfo('');

    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions and Rental Agreement.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // NOTE: NEVER send role from frontend. The DB trigger automatically sets role = 'customer'
      const res = await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      setIsSubmitting(false);

      if (res.success) {
        if (res.emailConfirmationRequired) {
          // Supabase project requires email confirmation
          setSuccessInfo(
            'Registration successful! Please check your email inbox to confirm your account before logging in.'
          );
        } else {
          // Instant session confirmed
          navigate('/', { replace: true });
        }
      } else {
        setError(res.error || 'Failed to create customer account. Please try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'An unexpected error occurred during signup.');
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
            <h1 className="text-2xl font-extrabold text-white">Create Customer Account</h1>
            <p className="text-xs text-slate-400 mt-1">
              Join Rent Rides to reserve luxury & sports cars across premier locations.
            </p>
          </div>

          {/* Confirmation Notice */}
          {successInfo && (
            <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/50 text-xs text-emerald-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-[#bef264]" />
                <span>Verification Email Sent</span>
              </div>
              <p className="leading-relaxed text-slate-300">{successInfo}</p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-block px-3 py-1.5 rounded-lg bg-[#bef264] text-black font-bold text-xs hover:bg-[#aee64b]"
                >
                  Proceed to Sign In →
                </Link>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/40 text-xs text-red-200">
              <strong className="block font-semibold mb-0.5">Registration Error:</strong>
              {error}
            </div>
          )}

          {/* Form */}
          {!successInfo && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="signup-fullname" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-fullname"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="e.g. Jordan Hayes"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="jordan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-phone" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Phone Number <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+1 (555) 019-2834"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirmpassword" className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="signup-confirmpassword"
                    type="password"
                    required
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#182128] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#bef264]"
                  />
                </div>
              </div>

              {/* Terms Agreement Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-[#182128] text-[#bef264] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#bef264]"
                  />
                  <span className="text-xs text-slate-400 leading-snug">
                    I agree to the{' '}
                    <span className="text-white hover:underline cursor-pointer">
                      Terms & Conditions
                    </span>{' '}
                    and Rental Agreement.
                  </span>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                className="w-full font-bold justify-center text-sm shadow-xl mt-2"
              >
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          {/* Footer Link to Login */}
          <div className="text-center pt-2 text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-[#bef264] hover:underline font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
