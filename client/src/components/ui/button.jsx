'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

const buttonVariants = ({ variant = 'default', size = 'default', className = '' } = {}) => {
  const base =
    'inline-flex items-center justify-center whitespace-nowrap rounded-[6px] text-xs sm:text-sm font-medium transition-all active:scale-[0.98] focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-brand disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none';

  const variants = {
    default: 'bg-brand text-white hover:bg-brand-hover shadow-xs',
    brand: 'bg-brand text-white hover:bg-brand-hover shadow-xs',
    accent: 'bg-accent text-white hover:bg-accent-hover shadow-xs',
    destructive: 'bg-accent text-white hover:bg-accent-hover shadow-xs',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 shadow-2xs',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    ghost: 'hover:bg-slate-100 text-slate-700 hover:text-slate-900',
    link: 'text-brand underline-offset-4 hover:underline active:scale-100',
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

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ...children.props,
        className: cn(buttonVariants({ variant, size, className }), children.props.className),
        ref: ref || children.props?.ref,
      });
    }

    return (
      <button
        className={buttonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
