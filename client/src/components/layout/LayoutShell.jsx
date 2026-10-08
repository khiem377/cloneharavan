'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Header from '@/components/header/Header';
import Footer from '@/components/layout/Footer';

const AiChatWidget = dynamic(() => import('@/components/chat/AiChatWidget'), { ssr: false });
const QuickViewModal = dynamic(() => import('@/components/product/QuickViewModal'), { ssr: false });
const CompareBar = dynamic(() => import('@/components/product/CompareBar'), { ssr: false });

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
