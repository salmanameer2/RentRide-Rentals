import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  LogOut,
  Shield,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogout = async () => {
    await logout(true);
    navigate('/admin/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Bookings',
      path: '/admin/bookings',
      icon: CalendarCheck,
    },
    {
      name: 'Fleet / Cars',
      path: '/admin/cars',
      icon: Car,
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: Users,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between bg-[#0e1317] border-r border-slate-800/90 text-slate-300 w-64 select-none">
      {/* Brand & Portal Badge */}
      <div>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1c242b] border border-slate-700 flex items-center justify-center text-[#bef264]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-white text-sm tracking-tight flex items-center gap-1.5">
                Rent<span className="text-[#bef264]">Rides</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#bef264]/10 text-[#bef264] border border-[#bef264]/20">
                  ADMIN
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono">
                Management Console
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
            Operations
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#bef264] text-black shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-[#161f26]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Admin User Footer & Logout */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {/* Current Admin Pill */}
        <div className="p-3 rounded-xl bg-[#151c22] border border-slate-800 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Authenticated Admin
          </div>
          <div className="font-bold text-white truncate mt-0.5">
            {user?.fullName || 'Marcus Vance'}
          </div>
          <div className="text-[11px] text-slate-500 truncate font-mono">
            {user?.email || 'admin@rentrides.com'}
          </div>
        </div>

        {/* Dedicated Admin Logout Button */}
        <button
          type="button"
          onClick={handleAdminLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold text-red-300 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Admin Portal</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
