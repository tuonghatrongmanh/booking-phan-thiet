"use client";

import { useEffect } from "react";
import { REF_COOKIE, REF_COOKIE_DAYS, normalizeRefCode } from "@/lib/referral-utils";

// Khách vào bằng link có ?ref=MA của Sale -> nhớ mã 30 ngày (cookie) để gắn vào đơn đặt phòng/thuê xe sau đó.
// Người dùng mới nhất bấm link thì tính cho Sale đó ("last click"). Mã sai định dạng bị bỏ qua.
export default function RefCapture() {
  useEffect(() => {
    const code = normalizeRefCode(new URLSearchParams(window.location.search).get("ref"));
    if (!code) return;
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${REF_COOKIE}=${code}; max-age=${REF_COOKIE_DAYS * 86400}; path=/; SameSite=Lax${secure}`;
  }, []);
  return null;
}
