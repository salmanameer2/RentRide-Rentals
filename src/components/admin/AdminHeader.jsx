import React from 'react';
import { Menu, Bell, Shield, CheckCircle2, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader({ onMenuClick, title = 'Administration' }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 bg-[#090d10]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu trigger & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Open admin sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {title}
            </h1>
            <div className="text-[11px] text-slate-400 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[#bef264]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-ping" />
                Live Control Room
              </span>
              <span>•</span>
              <span>Enterprise RBAC Enforced</span>
            </div>
          </div>
        </div>

        {/* Right Status Badges & User Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#11171d] border border-slate-700/80 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#bef264]" />
            <span>Fleet Fleet Sync: Active</span>
          </div>

          {/* Admin Profile Tag */}
          <div className="flex items-center gap-2.5 bg-[#12181d] border border-slate-800 px-3 py-1.5 rounded-full">
            <div className="w-6 h-6 rounded-full bg-[#bef264] text-black font-bold text-xs flex items-center justify-center">
              A
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-white leading-none">
                {user?.fullName || 'Marcus Vance'}
              </div>
              <div className="text-[10px] text-[#bef264] font-semibold">
                Administrator
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
