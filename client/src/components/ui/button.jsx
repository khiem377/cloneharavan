'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = ({ variant = 'default', size = 'default', className = '' } = {}) => {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-xs sm:text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-red-600 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none';

  const variants = {
    default: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
    destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 shadow-2xs',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900',
    link: 'text-red-600 underline-offset-4 hover:underline active:scale-100',
  };

  const sizes = {
    default: 'h-8 px-3 py-1.5',
    sm: 'h-7 rounded-[6px] px-2.5 text-xs',
    lg: 'h-10 rounded-[6px] px-6 text-sm',
    icon: 'h-8 w-8',
    'icon-sm': 'h-6 w-6',
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);
};

const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
