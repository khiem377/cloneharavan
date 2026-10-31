'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

const Checkbox = React.forwardRef(({ className, checked, onChange, ...props }, ref) => {
  return (
    <input
      type="checkbox"
      ref={ref}
      checked={checked}
      onChange={onChange}
      className={cn(
        'h-3.5 w-3.5 rounded-[3px] border-slate-300 text-brand accent-brand focus:ring-1 focus:ring-brand cursor-pointer transition-colors',
        className
      )}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
