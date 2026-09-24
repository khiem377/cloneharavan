import * as React from 'react';
import { cn } from '../../lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'border-transparent bg-red-600 text-white',
    secondary: 'border-transparent bg-gray-100 text-gray-700',
    destructive: 'border-transparent bg-red-50 text-red-600 border border-red-100',
    outline: 'text-gray-700 border-gray-200 bg-white',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
