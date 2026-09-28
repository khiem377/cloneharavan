'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

const TabsContext = React.createContext(null);

const Tabs = ({ value, defaultValue, onValueChange, children, className }) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || '');
  const activeValue = value !== undefined ? value : selectedValue;

  const handleValueChange = (val) => {
    if (value === undefined) {
      setSelectedValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ activeValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1 border-b border-slate-200 bg-transparent p-0 text-slate-500 w-full',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  const isActive = context?.activeValue === value;

  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={() => context?.onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-all cursor-pointer relative border-b-2 -mb-px',
        isActive
          ? 'border-red-600 text-red-600 font-semibold'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300',
        'active:scale-[0.98]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
  const context = React.useContext(TabsContext);
  if (context?.activeValue !== value) return null;

  return (
    <div
      ref={ref}
      role="tabpanel"
      className={cn('pt-4 focus-visible:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
