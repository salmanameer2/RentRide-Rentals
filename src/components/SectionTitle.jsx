import React from 'react';

/**
 * Reusable SectionTitle component matching the reference design visual hierarchy
 */
export default function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  theme = 'dark', // 'dark' (white text on dark bg) or 'light' (dark text on white/slate bg)
  className = '',
}) {
  const isCenter = align === 'center';
  const isLight = theme === 'light';

  return (
    <div
      className={`mb-8 sm:mb-12 ${
        isCenter ? 'text-center mx-auto max-w-2xl' : 'max-w-3xl'
      } ${className}`}
    >
      {eyebrow && (
        <div
          className={`text-xs font-bold tracking-[0.2em] uppercase mb-2 ${
            isLight ? 'text-emerald-700' : 'text-[#bef264]'
          }`}
        >
          {eyebrow}
        </div>
      )}
      <h2
        className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-3 text-sm sm:text-base leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-slate-400'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
