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
        'h-3.5 w-3.5 rounded border-gray-300 text-red-600 accent-red-600 focus:ring-0 focus:ring-offset-0 cursor-pointer transition-colors',
        className
      )}
      {...props}
    />
  );
});
Checkbox.displayName = 'Checkbox';

export { Checkbox };
