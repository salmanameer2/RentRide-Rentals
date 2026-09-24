import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import AnimatedPage from '../components/AnimatedPage';

/**
 * Scroll restoration helper component
 */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/**
 * Main application layout wrapping Navbar, main view content, and Footer
 * Used exclusively for Public and Customer routes.
 */
export default function MainLayout() {
  const { isAdmin, loading, profileLoading } = useAuth();
  const location = useLocation();

  // 1. Handle Loading State to prevent UI Flash
  if (loading || profileLoading) {
    return <Loader message="Initializing experience..." fullScreen />;
  }

  // 2. Prevent Admins from entering the customer application
  // If an authenticated admin visits any customer route, send them to their dashboard
  // EXCEPT if they are on the login or signup pages (Requirement 1)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  if (isAdmin && !isAuthPage) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f12] text-slate-100 antialiased selection:bg-[#bef264] selection:text-black">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20">
        <AnimatedPage key={location.pathname}>
          <Outlet />
        </AnimatedPage>
      </main>
      <Footer />
    </div>
  );
}
