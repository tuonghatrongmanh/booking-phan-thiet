import type { Metadata, Viewport } from "next";
import "./globals.css";
import PopupModal from "@/components/home/PopupModal";
import SaleStandingGate from "@/components/home/SaleStandingGate";
import RapidNavGuard from "@/components/ui/RapidNavGuard";
import DialogProvider from "@/components/ui/DialogProvider";
import { getSiteSettings } from "@/lib/settings";

// Day la metadata MAC DINH cho toan site - trang nao khong tu khai bao metadata rieng
// (vd trang chu page.tsx) se dung nguyen bo nay, nen "SEO trang chu" trong admin Cai
// dat chinh la sua o day.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.homeSeoTitle,
    description: settings.homeSeoDescription,
    icons: { icon: settings.faviconUrl, apple: "/images/apple-touch-icon.png" },
  };
}

// Màu thanh trình duyệt trên điện thoại = màu thương hiệu
export const viewport: Viewport = { themeColor: "#003b95" };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
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
        <DialogProvider>
          {children}
          <PopupModal />
          <SaleStandingGate />
          <RapidNavGuard />
        </DialogProvider>
      </body>
    </html>
  );
}
