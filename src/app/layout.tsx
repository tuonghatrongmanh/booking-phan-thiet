import type { Metadata, Viewport } from "next";
import "./globals.css";
import PopupModal from "@/components/home/PopupModal";
import SaleStandingGate from "@/components/home/SaleStandingGate";
import RapidNavGuard from "@/components/ui/RapidNavGuard";
import DialogProvider from "@/components/ui/DialogProvider";
import { getSiteSettings } from "@/lib/settings";
import SiteJsonLd from "@/components/seo/SiteJsonLd";
import GoogleAnalytics from "@/components/seo/GoogleAnalytics";
import SwipeHints from "@/components/ui/SwipeHints";
import AiChatWidget from "@/components/chat/AiChatWidget";
import NoPinchZoom from "@/components/ui/NoPinchZoom";
import { SITE_URL } from "@/lib/site-url";
import { getActiveTheme } from "@/lib/site-theme";
import { getUiSlots } from "@/lib/ui-slots";
import { UiSlotsProvider } from "@/components/ui/UiSlots";
import { connection } from "next/server";

// Day la metadata MAC DINH cho toan site - trang nao khong tu khai bao metadata rieng
// (vd trang chu page.tsx) se dung nguyen bo nay, nen "SEO trang chu" trong admin Cai
// dat chinh la sua o day.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.homeSeoTitle,
    description: settings.homeSeoDescription,
    metadataBase: new URL(SITE_URL),
    icons: { icon: settings.faviconUrl, apple: "/images/apple-touch-icon.png" },
    // Mã xác minh Search Console / Bing nhập ở Admin > Cài đặt
    verification: {
      google: settings.googleSiteVerification || undefined,
      other: settings.bingSiteVerification ? { "msvalidate.01": settings.bingSiteVerification } : undefined,
    },
    openGraph: {
      type: "website",
      siteName: settings.orgName || "Booking Phan Thiết",
      locale: "vi_VN",
      title: settings.homeSeoTitle,
      description: settings.homeSeoDescription,
    },
  };
}

// Màu thanh trình duyệt trên điện thoại = màu chủ đạo của giao diện đang áp dụng (mùa lễ hội đổi theo)
export async function generateViewport(): Promise<Viewport> {
  const theme = await getActiveTheme();
  // Khóa phóng to trên điện thoại (maximum-scale=1): xem thêm NoPinchZoom + touch-action trong globals.css
  return { themeColor: theme.primary, width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Giao diện lễ hội đổi bất cứ lúc nào từ admin -> mọi trang phải render theo từng request (không đóng băng lúc build)
  await connection();
  const [settings, theme, uiSlots] = await Promise.all([getSiteSettings(), getActiveTheme(), getUiSlots()]);
  return (
    <html lang="vi" data-theme={theme.key} style={theme.vars as React.CSSProperties}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Caveat:wght@600;700&display=swap"
          rel="stylesheet"
        />
        {/* Font Awesome (bản Web Fonts + CSS, không dùng SVG) */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
        />
      </head>
      <body className="bg-slate-50 text-slate-800 antialiased">
        <SiteJsonLd />
        <GoogleAnalytics measurementId={settings.googleAnalyticsId} />
        <DialogProvider>
          <UiSlotsProvider slots={uiSlots}>
          {children}
          <PopupModal />
          <SaleStandingGate />
          <RapidNavGuard />
          <SwipeHints />
          <AiChatWidget />
          <NoPinchZoom />
          </UiSlotsProvider>
        </DialogProvider>
      </body>
    </html>
  );
}
