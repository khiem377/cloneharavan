'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const Accordion = ({ children, className }) => (
  <div className={cn('divide-y divide-slate-100', className)}>{children}</div>
);

const AccordionItem = ({ value, children, className }) => (
  <div className={cn('py-0.5', className)}>{children}</div>
);

const AccordionTrigger = ({ children, isOpen, onToggle, className }) => (
  <button
    type="button"
    onClick={onToggle}
    className={cn(
      'flex w-full items-center justify-between py-2.5 px-4 text-xs font-bold text-slate-900 uppercase tracking-wide transition-all hover:bg-slate-50/70 select-none cursor-pointer rounded-[4px]',
      className
    )}
  >
    {children}
    <ChevronDown
      className={cn(
        'h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0',
        isOpen && 'rotate-180 text-slate-700'
      )}
    />
  </button>
);

const AccordionContent = ({ isOpen, children, className }) => {
  if (!isOpen) return null;
  return (
    <div
      className={cn(
        'px-4 pb-3 pt-1 text-xs text-slate-600 animate-fadeIn',
        className
      )}
    >
      {children}
    </div>
  );
};

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
