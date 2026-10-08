import * as React from 'react';
import { cn } from '../../lib/utils';

const alertVariants = {
  default: 'bg-slate-50 text-slate-900 border-slate-200',
  destructive: 'border-rose-200 bg-rose-50 text-rose-800 [&>svg]:text-rose-600',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800 [&>svg]:text-emerald-600',
  warning: 'border-amber-200 bg-amber-50 text-amber-800 [&>svg]:text-amber-600',
};

const Alert = React.forwardRef(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      'relative w-full rounded-[6px] border p-3.5 text-xs [&>svg~*]:pl-6 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-3.5 [&>svg]:top-3.5 [&>svg]:text-slate-900',
      alertVariants[variant] || alertVariants.default,
      className
    )}
    {...props}
  />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-semibold leading-none tracking-tight text-xs', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-[11px] [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
