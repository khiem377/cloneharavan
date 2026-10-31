'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import HeaderTop from './HeaderTop';
import HeaderNav from './HeaderNav';
import CategoryDrawer from './CategoryDrawer';
import { settingService } from '@/services/setting.service';

export const Header = ({ initialUser = null }) => {
  const pathname = usePathname();
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [storeSetting, setStoreSetting] = useState(null);

  useEffect(() => {
    settingService.getPublicSettings().then((s) => {
      if (s?.storeInfo) setStoreSetting(s.storeInfo);
    });
  }, []);

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password';

  if (isAuthRoute) return null;

  return (
    <header className="w-full bg-white shadow-xs z-50 sticky top-0">
      <HeaderTop
        onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
        storeSetting={storeSetting}
        initialUser={initialUser}
      />
      <HeaderNav
        onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
        storeSetting={storeSetting}
      />
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
      />
    </header>
  );
};

export default Header;
