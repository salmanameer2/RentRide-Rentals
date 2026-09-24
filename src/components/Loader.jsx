import React from 'react';

/**
 * Reusable Loader component
 * Features subtle automotive/spin aesthetics
 */
export default function Loader({
  size = 'md',
  message = 'Loading Rent Rides fleet...',
  fullScreen = false,
  className = '',
}) {
  const sizeMap = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-14 h-14 border-4',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center p-6 gap-4 ${className}`}>
      <div className="relative">
        <div
          className={`${sizeMap[size] || sizeMap.md} rounded-full border-slate-800 border-t-[#bef264] animate-spin`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-[#bef264]/80 animate-ping" />
        </div>
      </div>
      {message && (
        <p className="text-sm font-medium text-slate-400 animate-pulse text-center">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0f12]/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
