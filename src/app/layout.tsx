import type { Metadata, Viewport } from "next";
import { Baloo_2, Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SHORT_NAME,
  APP_TAGLINE,
  BRAND_THEME_COLOR,
} from "@/lib/constants";
import "./globals.css";

/*
 * Typography thương hiệu (giống ago_frontend):
 * - Be Vietnam Pro: font thân, hỗ trợ đầy đủ tiếng Việt.
 * - Baloo 2: font tiêu đề bo tròn khớp logo agofruit (--font-heading).
 */
const beVietnam = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_SHORT_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  /* PWA trên iOS: mở từ màn hình chính không có thanh địa chỉ. */
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_SHORT_NAME,
  },
};

/*
 * maximumScale 1 + viewport-fit cover: giữ đúng meta viewport bản vanilla —
 * tránh iOS tự zoom khi chạm vào ô nhập, và tràn nền tới tai thỏ.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: BRAND_THEME_COLOR,
};

/*
 * Root layout: font + provider toàn cục (TanStack Query, Toaster) + khung app
 * (header dính, vùng nội dung, chỉ báo đang xử lý) + đăng ký service worker.
 * App chỉ có một khung cho mọi màn nên AppShell đặt ngay đây; page.tsx chỉ
 * render component từ features/.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${beVietnam.variable} ${baloo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>
          <AppShell subtitle={APP_TAGLINE}>{children}</AppShell>
        </AppProviders>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
