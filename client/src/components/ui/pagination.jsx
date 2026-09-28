'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { buttonVariants } from './button';

const Pagination = ({ className, ...props }) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('mx-auto flex w-full justify-center', className)}
    {...props}
  />
);
Pagination.displayName = 'Pagination';

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1 sm:gap-1.5', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

const PaginationLink = ({
  className,
  isActive,
  size = 'default',
  href,
  onClick,
  children,
  ...props
}) => {
  const activeClass = isActive
    ? 'bg-[#284ea1] text-white hover:bg-[#1e3b82] shadow-xs border-[#284ea1]'
    : 'border border-gray-200 bg-white text-gray-700 hover:bg-slate-100 hover:text-gray-900';

  const baseClass = cn(
    buttonVariants({
      variant: 'outline',
      size,
    }),
    'min-w-8 h-8 px-2.5 text-xs font-semibold rounded-md transition-all cursor-pointer select-none',
    activeClass,
    className
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        className={baseClass}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={baseClass}
      {...props}
    >
      {children}
    </button>
  );
};
PaginationLink.displayName = 'PaginationLink';

const PaginationFirst = ({
  className,
  href,
  onClick,
  disabled,
  ...props
}) => (
  <PaginationLink
    aria-label="Về trang đầu"
    size="default"
    href={disabled ? undefined : href}
    onClick={disabled ? undefined : onClick}
    className={cn(
      'gap-1 px-2 cursor-pointer',
      disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
      className
    )}
    title="Trang đầu"
    {...props}
  >
    <ChevronsLeft className="h-4 w-4" />
    <span className="hidden sm:inline">Đầu</span>
  </PaginationLink>
);
PaginationFirst.displayName = 'PaginationFirst';

const PaginationPrevious = ({
  className,
  href,
  onClick,
  disabled,
  ...props
}) => (
  <PaginationLink
    aria-label="Trang trước"
    size="default"
    href={disabled ? undefined : href}
    onClick={disabled ? undefined : onClick}
    className={cn(
      'gap-1 px-2.5 cursor-pointer',
      disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
      className
    )}
    title="Trang trước"
    {...props}
  >
    <ChevronLeft className="h-4 w-4" />
    <span className="hidden sm:inline">Trước</span>
  </PaginationLink>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  href,
  onClick,
  disabled,
  ...props
}) => (
  <PaginationLink
    aria-label="Trang tiếp"
    size="default"
    href={disabled ? undefined : href}
    onClick={disabled ? undefined : onClick}
    className={cn(
      'gap-1 px-2.5 cursor-pointer',
      disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
      className
    )}
    title="Trang tiếp"
    {...props}
  >
    <span className="hidden sm:inline">Tiếp</span>
    <ChevronRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationLast = ({
  className,
  href,
  onClick,
  disabled,
  ...props
}) => (
  <PaginationLink
    aria-label="Đến trang cuối"
    size="default"
    href={disabled ? undefined : href}
    onClick={disabled ? undefined : onClick}
    className={cn(
      'gap-1 px-2 cursor-pointer',
      disabled && 'pointer-events-none opacity-40 cursor-not-allowed',
      className
    )}
    title="Trang cuối"
    {...props}
  >
    <span className="hidden sm:inline">Cuối</span>
    <ChevronsRight className="h-4 w-4" />
  </PaginationLink>
);
PaginationLast.displayName = 'PaginationLast';

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn('flex h-8 w-8 items-center justify-center text-gray-400 select-none', className)}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Xem thêm trang</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationFirst,
  PaginationPrevious,
  PaginationNext,
  PaginationLast,
};
