import './globals.css';
import { Be_Vietnam_Pro } from 'next/font/google';
import { menuService } from '@/services/menu.service';
import { categoryService } from '@/services/category.service';
import { searchService } from '@/services/search.service';
import StoreProvider from '@/providers/StoreProvider';
import LayoutShell from '@/components/layout/LayoutShell';
import TopProgressBar from '@/components/common/TopProgressBar';
import ScrollToTop from '@/components/common/ScrollToTop';
import { ToastContainer } from '@/components/ui/toast';
import { ConfirmDialogContainer } from '@/components/ui/confirm-dialog';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-be-vietnam-pro',
  display: 'swap',
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'SHOP — Siêu thị điện máy & công nghệ chính hãng',
    template: '%s | SHOP',
  },
  description:
    'Hệ thống siêu thị điện máy, công nghệ chính hãng hàng đầu. Mua sắm tivi, tủ lạnh, máy giặt, điều hòa, đồ gia dụng & thiết bị công nghệ với giá tốt nhất, hỗ trợ trả góp 0%, giao hàng toàn quốc.',
  keywords: [
    'siêu thị điện máy',
    'điện máy chính hãng',
    'tivi',
    'tủ lạnh',
    'máy giặt',
    'điều hòa',
    'đồ gia dụng',
    'thiết bị công nghệ',
    'SHOP',
  ],
  authors: [{ name: 'SHOP' }],
  creator: 'SHOP',
  publisher: 'SHOP',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: ['/icon.svg'],
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: 'SHOP — Siêu thị điện máy & công nghệ chính hãng',
    title: 'SHOP — Siêu thị điện máy & công nghệ chính hãng',
    description:
      'Hệ thống siêu thị điện máy, công nghệ chính hãng hàng đầu. Mua sắm tivi, tủ lạnh, máy giặt, điều hòa, đồ gia dụng & thiết bị công nghệ với giá tốt nhất, hỗ trợ trả góp 0%, giao hàng toàn quốc.',
    images: [
      {
        url: '/images/og-shop.png',
        width: 1200,
        height: 630,
        alt: 'SHOP — Siêu thị điện máy & công nghệ chính hãng',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SHOP — Siêu thị điện máy & công nghệ chính hãng',
    description:
      'Hệ thống siêu thị điện máy, công nghệ chính hãng hàng đầu. Cam kết 100% chính hãng, trả góp 0%, giao hàng toàn quốc.',
    images: ['/images/og-shop.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({ children }) {
  const [initialMenu, initialFooterMenu, initialCategories, initialTrending] = await Promise.all([
    menuService.getServerMenu('main-menu'),
    menuService.getServerMenu('footer'),
    categoryService.getServerCategoryTree(),
    searchService.getServerTrending(10, 'all'),
  ]);

  return (
    <html lang="vi" className={`h-full ${beVietnamPro.variable}`}>
      <body className={`min-h-[100dvh] flex flex-col bg-white text-slate-900 antialiased overflow-x-hidden w-full max-w-full ${beVietnamPro.className}`}>
        <TopProgressBar />
        <ScrollToTop />
        <ToastContainer />
        <ConfirmDialogContainer />
        <StoreProvider
          initialMenu={initialMenu}
          initialCategories={initialCategories}
          initialTrending={initialTrending}
        >
          <LayoutShell initialFooterMenu={initialFooterMenu}>
            {children}
          </LayoutShell>
        </StoreProvider>
      </body>
    </html>
  );
}
