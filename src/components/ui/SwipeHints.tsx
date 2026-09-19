"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Gợi ý "còn nội dung phía sau, hãy vuốt" cho các khối cuộn ngang (thẻ có thuộc tính
// data-swipe-hint) trên điện thoại: khi khối cuộn vào màn hình lần đầu, nó tự lướt nhẹ sang
// phải rồi quay lại và hiện hình bàn tay vuốt (kiểu game). Chạm vào là dừng ngay. Tự tắt khi
// người dùng bật "giảm chuyển động", trên máy tính bàn, và trang admin.
export default function SwipeHints() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: none), (max-width: 767px)").matches) return;

    const seen = new WeakSet<Element>();
    const timers: number[] = [];
    let hand: HTMLElement | null = null;

    function removeHand() {
      hand?.remove();
      hand = null;
    }

    function showHand(el: HTMLElement) {
      removeHand();
      const rect = el.getBoundingClientRect();
      const node = document.createElement("div");
      node.className = "swipe-hint-hand";
      node.setAttribute("aria-hidden", "true");
      node.innerHTML = '<i class="fa-solid fa-hand-pointer"></i><span>Vuốt để xem thêm</span>';
      node.style.left = Math.max(8, rect.left + rect.width / 2 - 60) + "px";
      node.style.top = Math.max(70, Math.min(window.innerHeight - 110, rect.top + rect.height / 2 - 30)) + "px";
      document.body.appendChild(node);
      hand = node;
      timers.push(window.setTimeout(removeHand, 2000));
    }

    function nudge(el: HTMLElement) {
      const max = el.scrollWidth - el.clientWidth;
      const start = el.scrollLeft; // khối có padding đầu nên vị trí "đầu" có thể là ~20-24px
      if (max < 24 || start > 48) return; // không cuộn được, hoặc khách đã tự vuốt xa rồi
      const prevSnap = el.style.scrollSnapType;
      el.style.scrollSnapType = "none";
      const peek = Math.min(max, Math.max(72, el.clientWidth * 0.32));
      const stop = () => {
        removeHand();
        el.style.scrollSnapType = prevSnap;
      };
      el.addEventListener("touchstart", stop, { once: true, passive: true });
      el.scrollTo({ left: start + peek, behavior: "smooth" });
      timers.push(window.setTimeout(() => el.scrollTo({ left: start, behavior: "smooth" }), 950));
      timers.push(window.setTimeout(() => (el.style.scrollSnapType = prevSnap), 1800));
      showHand(el);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || seen.has(entry.target)) continue;
          seen.add(entry.target);
          io.unobserve(entry.target);
          timers.push(window.setTimeout(() => nudge(entry.target as HTMLElement), 450));
        }
      },
      { threshold: 0.7 }
    );

    function scan() {
      document.querySelectorAll("[data-swipe-hint]").forEach((el) => {
        if (!seen.has(el)) io.observe(el);
      });
    }
    scan();
    // Nội dung stream/hiện muộn cũng được quét
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      removeHand();
    };
  }, [pathname]);

  return null;
}
