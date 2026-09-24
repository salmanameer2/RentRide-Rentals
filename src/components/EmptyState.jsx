import React from 'react';
import { CarFront, SearchX } from 'lucide-react';
import Button from './Button';

/**
 * Reusable EmptyState component
 */
export default function EmptyState({
  title = 'No vehicles found',
  description = 'Try adjusting your search criteria or changing selected filters.',
  actionLabel,
  onAction,
  actionTo,
  icon: CustomIcon,
  className = '',
}) {
  const IconComponent = CustomIcon || SearchX;

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-slate-800 bg-[#11161a]/60 backdrop-blur-sm max-w-lg mx-auto my-8 ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-[#1c242b] border border-slate-700/60 flex items-center justify-center text-[#bef264] mb-4 shadow-inner">
        <IconComponent className="w-8 h-8" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {(actionLabel && (onAction || actionTo)) && (
        <Button
          variant="primary"
          size="sm"
          onClick={onAction}
          to={actionTo}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
