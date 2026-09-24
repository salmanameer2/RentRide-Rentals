import React from 'react';

/**
 * Reusable Admin Status Badge
 */
export default function AdminBadge({ status, className = '' }) {
  const normalized = (status || '').toLowerCase();

  let styles = 'bg-slate-800 text-slate-300 border-slate-700';

  if (normalized === 'confirmed' || normalized === 'active' || normalized === 'available' || normalized === 'verified') {
    styles = 'bg-emerald-500/10 text-[#bef264] border-emerald-500/30';
  } else if (normalized === 'pending' || normalized === 'in maintenance') {
    styles = 'bg-amber-500/10 text-amber-300 border-amber-500/30';
  } else if (normalized === 'cancelled' || normalized === 'rejected' || normalized === 'rented') {
    styles = 'bg-red-500/10 text-red-400 border-red-500/30';
  } else if (normalized === 'completed') {
    styles = 'bg-sky-500/10 text-sky-300 border-sky-500/30';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />
      {status}
    </span>
  );
}
