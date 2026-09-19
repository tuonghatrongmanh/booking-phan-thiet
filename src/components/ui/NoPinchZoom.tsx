"use client";

import { useEffect } from "react";

// Chặn phóng to bằng 2 ngón (pinch) và chạm đúp trên điện thoại - tránh cảm giác trang bị
// rung lắc/xê dịch khi vô tình chạm 2 ngón. Android Chrome đã bị chặn bởi viewport
// (maximum-scale=1) + CSS touch-action; iOS Safari phớt lờ viewport nên phải chặn thêm bằng
// sự kiện gesture* và touchmove nhiều ngón. Chỉ ảnh hưởng thao tác nhiều ngón - cuộn 1 ngón,
// bấm, vuốt carousel vẫn bình thường.
export default function NoPinchZoom() {
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    const blockMulti = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    document.addEventListener("gesturestart", block);
    document.addEventListener("gesturechange", block);
    document.addEventListener("gestureend", block);
    document.addEventListener("touchmove", blockMulti, { passive: false });
    return () => {
      document.removeEventListener("gesturestart", block);
      document.removeEventListener("gesturechange", block);
      document.removeEventListener("gestureend", block);
      document.removeEventListener("touchmove", blockMulti);
    };
  }, []);
  return null;
}
