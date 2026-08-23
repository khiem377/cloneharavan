import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "@/context/CartContext";
import { GuestCartPopup } from "@/components/cart/GuestCartPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cửa hàng",
  description: "Mua sắm trực tuyến nhanh chóng và tiện lợi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CartProvider>
          {/* Popup thông báo Guest Cart — hiển thị 1 lần khi Guest thêm sản phẩm đầu tiên */}
          <GuestCartPopup />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
