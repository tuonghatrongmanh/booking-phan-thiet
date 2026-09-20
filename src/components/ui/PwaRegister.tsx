"use client";

import { useEffect } from "react";
import "@/lib/pwa-install";

// Đăng ký service worker (để cài được như app + có trang ngoại tuyến). Trễ 2 giây để không tranh băng thông lúc tải trang.
export default function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const t = setTimeout(() => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }, 2000);
    return () => clearTimeout(t);
  }, []);
  return null;
}
