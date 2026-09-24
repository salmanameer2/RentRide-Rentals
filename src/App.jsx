import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Public & Customer Pages
import Home from './pages/Home';
import Fleet from './pages/Fleet';
import HowItWorks from './pages/HowItWorks';
import CarDetails from './pages/CarDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Customer Authenticated Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerBookings from './pages/customer/CustomerBookings';
import BookingDetails from './pages/customer/BookingDetails';
import CustomerProfile from './pages/customer/CustomerProfile';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCars from './pages/admin/AdminCars';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';

import EmptyState from './components/EmptyState';
import Container from './components/Container';

function NotFound() {
  return (
    <Container className="py-24 text-center">
      <EmptyState
        title="404 — Page Not Found"
        description="The destination route you are looking for does not exist."
        actionLabel="Return Home"
        actionTo="/"
      />
    </Container>
  );
}

function ConfigWarning() {
  const [dismissed, setDismissed] = React.useState(false);
  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  if (isConfigured || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0b0f12] flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-[#12181d] border border-red-500/30 p-8 rounded-3xl shadow-2xl">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Configuration Required</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Supabase environment variables are missing. Please add <code className="text-[#bef264] bg-[#bef264]/10 px-1.5 py-0.5 rounded">VITE_SUPABASE_URL</code> and <code className="text-[#bef264] bg-[#bef264]/10 px-1.5 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code> to your secrets in the AI Studio settings.
        </p>
        
        <div className="bg-slate-900/50 rounded-2xl p-4 mb-6 text-left border border-white/5">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Steps to fix</p>
          <ol className="text-xs text-slate-400 space-y-2 list-decimal pl-4">
            <li>Open <span className="text-white font-medium">Settings</span> (gear icon) in AI Studio</li>
            <li>Go to <span className="text-white font-medium">Secrets</span></li>
            <li>Add the missing variables</li>
          </ol>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={() => setDismissed(true)}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-colors border border-white/10"
          >
            Continue in Demo Mode (Local Only)
          </button>
          <p className="text-[10px] text-slate-500">
            Note: Authentication and database persistence will not work in Demo Mode.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConfigWarning />
      <BrowserRouter>
        <Routes>
          {/* =========================================
              CUSTOMER & PUBLIC APPLICATION
              ========================================= */}
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="fleet" element={<Fleet />} />
            <Route path="fleet/:id" element={<CarDetails />} />
            <Route path="how-it-works" element={<HowItWorks />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />

            {/* Authenticated Customer Only Routes */}
            <Route
              path="dashboard"
              element={
                <ProtectedRoute>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <CustomerBookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings/:id"
              element={
                <ProtectedRoute>
                  <BookingDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <CustomerProfile />
                </ProtectedRoute>
              }
            />

            {/* Catch-all 404 for Customer App */}
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* =========================================
              ADMINISTRATIVE APPLICATION
              ========================================= */}
          {/* 1. Standalone Admin Login (No customer layout) */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 2. Protected Admin Management Console */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            {/* Redirect /admin directly to dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            
            {/* Primary Admin Routes */}
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="cars" element={<AdminCars />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />

            {/* Fallback for Admin Route domain */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

