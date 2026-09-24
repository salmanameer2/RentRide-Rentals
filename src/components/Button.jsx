import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button component
 * Variants: primary, secondary, outline, ghost, danger
 * States: default, hover, active, disabled, loading
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  iconPosition = 'right',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bef264] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0f12] select-none whitespace-nowrap cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#bef264] text-black font-semibold hover:bg-[#a3e635] shadow-[0_2px_12px_rgba(190,242,100,0.25)] hover:shadow-[0_4px_16px_rgba(190,242,100,0.4)]',
    secondary:
      'bg-[#1a232b] text-white hover:bg-[#25323d] border border-slate-700/70 shadow-sm',
    outline:
      'bg-transparent border border-slate-700 text-slate-200 hover:border-[#bef264] hover:text-[#bef264] hover:bg-[#bef264]/5',
    ghost:
      'bg-transparent text-slate-300 hover:text-white hover:bg-white/5',
    danger:
      'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
    variantStyles[variant] || variantStyles.primary
  } ${className}`;

  const content = (
    <>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      {...props}
    >
      {content}
    </button>
  );
}
