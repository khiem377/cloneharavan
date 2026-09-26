import './globals.css';
import { Be_Vietnam_Pro } from 'next/font/google';
import { menuService } from '@/services/menu.service';
import { categoryService } from '@/services/category.service';
import { searchService } from '@/services/search.service';
import StoreProvider from '@/providers/StoreProvider';
import Header from '@/components/header/Header';
import QuickViewModal from '@/components/product/QuickViewModal';
import CompareBar from '@/components/product/CompareBar';
import TopProgressBar from '@/components/common/TopProgressBar';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const metadata = {
  title: 'SHOP — Siêu thị điện máy & công nghệ chính hãng',
  description: 'Siêu thị điện máy & công nghệ chính hãng SHOP',
};

export default async function RootLayout({ children }) {
  const [initialMenu, initialCategories, initialTrending] = await Promise.all([
    menuService.getServerMenu('main-menu'),
    categoryService.getServerCategoryTree(),
    searchService.getServerTrending(10, 'all'),
  ]);

  return (
    <html lang="vi" className={`h-full ${beVietnamPro.variable}`}>
      <body className={`min-h-full flex flex-col bg-white text-slate-900 antialiased ${beVietnamPro.className}`}>
        <TopProgressBar />
        <StoreProvider
          initialMenu={initialMenu}
          initialCategories={initialCategories}
          initialTrending={initialTrending}
        >
          <Header />
          <main className="flex-1">{children}</main>
          <QuickViewModal />
          <CompareBar />
        </StoreProvider>
      </body>
    </html>
  );
}
