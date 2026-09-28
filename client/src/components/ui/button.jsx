'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = ({ variant = 'default', size = 'default', className = '' } = {}) => {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-red-600 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none';

  const variants = {
    default: 'bg-red-600 text-white hover:bg-red-700 shadow-xs',
    destructive: 'bg-red-500 text-white hover:bg-red-600 shadow-xs',
    outline: 'border border-gray-200 bg-white hover:bg-gray-50 hover:text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    link: 'text-red-600 underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-8 px-3 py-1.5',
    sm: 'h-7 rounded-md px-2.5 text-xs',
    lg: 'h-10 rounded-md px-6 text-sm',
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
