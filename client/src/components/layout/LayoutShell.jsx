'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/header/Header';
import Footer from '@/components/layout/Footer';
import AiChatWidget from '@/components/chat/AiChatWidget';
import QuickViewModal from '@/components/product/QuickViewModal';
import CompareBar from '@/components/product/CompareBar';

// Các path không cần header/footer/chatbot
const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];

export default function LayoutShell({ children, initialFooterMenu }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '?'));

  return (
    <>
      {!isAuthPage && <Header />}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">{children}</main>
      {!isAuthPage && <Footer initialMenu={initialFooterMenu} />}
      {!isAuthPage && <QuickViewModal />}
      {!isAuthPage && <CompareBar />}
      {!isAuthPage && <AiChatWidget />}
    </>
  );
}
