import * as React from 'react';
import { cn } from '../../lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  const variants = {
    default: 'border-transparent bg-red-600 text-white',
    secondary: 'border-slate-200 bg-slate-100 text-slate-700',
    destructive: 'border-red-200 bg-red-50 text-red-600',
    outline: 'text-slate-700 border-slate-200 bg-white',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-[4px] border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
