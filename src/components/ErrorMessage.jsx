import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * Reusable ErrorMessage component
 */
export default function ErrorMessage({
  title = 'Something went wrong',
  message = 'We encountered an issue loading this information. Please try again.',
  onRetry,
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-red-500/30 bg-red-950/20 p-6 sm:p-8 text-center max-w-lg mx-auto my-6 backdrop-blur-sm ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mx-auto mb-3">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="text-base sm:text-lg font-bold text-red-200 mb-1">{title}</h4>
      <p className="text-sm text-red-300/80 mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          icon={RefreshCw}
          iconPosition="left"
          className="border-red-500/40 text-red-200 hover:bg-red-500/10 hover:border-red-400"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
