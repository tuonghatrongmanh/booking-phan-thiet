"use client";

import { useEffect } from "react";

// Form tim kiem submit GET voi action="/luu-tru#ket-qua" - trinh duyet ve nguyen tac
// tu cuon toi id trung voi hash sau khi tai trang, nhung hanh vi nay khong on dinh o
// moi trinh duyet/tinh huong (vd form.submit() bang JS, hydration cua Next.js can
// thiep vao scroll restoration). Component nay chu dong cuon muot toi #ket-qua ngay
// sau khi trang tai xong de dam bao hoat dong nhat quan.
export default function ScrollToResults() {
  useEffect(() => {
    if (window.location.hash === "#ket-qua") {
      const el = document.getElementById("ket-qua");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return null;
}
