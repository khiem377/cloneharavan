'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

const Avatar = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100',
      className
    )}
    {...props}
  />
));
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef(({ className, src, alt = '', ...props }, ref) => {
  const resolvedSrc = typeof src === 'string' ? src : (src?.url || '');
  const [hasError, setHasError] = React.useState(!resolvedSrc);

  React.useEffect(() => {
    setHasError(!resolvedSrc);
  }, [resolvedSrc]);

  if (hasError || !resolvedSrc) return null;

  return (
    <img
      ref={ref}
      src={resolvedSrc}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn('aspect-square h-full w-full object-cover', className)}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    suppressHydrationWarning
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 select-none uppercase',
      className
    )}
    {...props}
  >
    {children}
  </div>
));
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
