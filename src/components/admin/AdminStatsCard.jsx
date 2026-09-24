import React from 'react';

/**
 * Reusable Admin Operations Statistics Card
 */
export default function AdminStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  accent = 'lime', // 'lime', 'emerald', 'amber', 'sky', 'rose'
}) {
  const accentBorders = {
    lime: 'hover:border-[#bef264]/40',
    emerald: 'hover:border-emerald-500/40',
    amber: 'hover:border-amber-500/40',
    sky: 'hover:border-sky-500/40',
    rose: 'hover:border-rose-500/40',
  };

  const accentIcons = {
    lime: 'bg-[#bef264]/10 text-[#bef264] border-[#bef264]/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    sky: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  };

  return (
    <div
      className={`rounded-2xl bg-[#11171d] border border-slate-800 p-5 shadow-sm transition-all duration-200 ${
        accentBorders[accent] || accentBorders.lime
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {Icon && (
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
              accentIcons[accent] || accentIcons.lime
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              trendPositive
                ? 'text-[#bef264] bg-[#bef264]/10'
                : 'text-amber-400 bg-amber-400/10'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 mt-2 truncate font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
}
