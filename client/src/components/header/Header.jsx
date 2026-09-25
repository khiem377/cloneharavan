'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import HeaderTop from './HeaderTop';
import HeaderNav from './HeaderNav';
import CategoryDrawer from './CategoryDrawer';

export const Header = () => {
  const pathname = usePathname();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';

  if (isAuthRoute) return null;

  return (
    <header className="w-full bg-white shadow-xs z-50 sticky top-0">
      <HeaderTop onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)} />
      <HeaderNav onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)} />
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
      />
    </header>
  );
};

export default Header;
