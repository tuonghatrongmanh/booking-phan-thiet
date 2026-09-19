"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

// Google Analytics 4 - chỉ nạp ở trang CÔNG KHAI (không đếm lượt xem của admin).
export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const pathname = usePathname();
  if (!measurementId || pathname?.startsWith("/admin")) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}');`}
      </Script>
    </>
  );
}
