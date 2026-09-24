import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import AnimatedPage from '../components/AnimatedPage';

export default function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine page title based on route
  const getPageTitle = (pathname) => {
    if (pathname.includes('/admin/bookings')) return 'Booking Operations';
    if (pathname.includes('/admin/cars')) return 'Fleet Management';
    if (pathname.includes('/admin/users')) return 'Customer Directory';
    return 'Executive Operations Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#070a0c] text-slate-100 flex flex-col lg:flex-row antialiased">
      {/* Dedicated Admin Sidebar */}
      <AdminSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Admin Content Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dedicated Admin Header */}
        <AdminHeader
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          title={getPageTitle(location.pathname)}
        />

        {/* Dynamic Admin Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <AnimatedPage key={location.pathname}>
            <Outlet />
          </AnimatedPage>
        </main>
      </div>
    </div>
  );
}
