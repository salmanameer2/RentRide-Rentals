import React from 'react';

/**
 * Reusable layout Container for consistent widths and padding
 */
export default function Container({ children, className = '', ...props }) {
  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
