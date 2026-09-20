"use client";

import { usePathname } from "next/navigation";
import type { ThemeEffect } from "@/lib/theme-schedule";

// Hiệu ứng rơi/bay theo giao diện lễ hội (hoa, tuyết, đèn lồng, pháo giấy, sao). Chỉ là trang trí:
// không chặn bấm (pointer-events none), tắt khi khách chọn "giảm chuyển động", bớt số lượng trên điện thoại.
const GLYPHS: Record<Exclude<ThemeEffect, "none">, string[]> = {
  petals: ["🌸", "🌼", "🌸"],
  snow: ["❄", "❅", "❆"],
  lanterns: ["🏮"],
  confetti: ["🎊", "🎉", "✨"],
  stars: ["✨", "⭐"],
};
const COUNT = { 1: 10, 2: 18, 3: 28 } as const;

// Số "ngẫu nhiên" cố định theo chỉ số. Chỉ dùng phép tính số nguyên (Math.imul) để server và trình duyệt cho
// kết quả GIỐNG HỆT nhau - Math.sin/Math.random lệch nhau ở chữ số thập phân cuối và gây lỗi hydration.
const rnd = (i: number, salt: number) => {
  let h = Math.imul(i + 1, 374761393) ^ Math.imul(salt + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
const r2 = (n: number) => Math.round(n * 100) / 100;

export default function ThemeEffects({ effect, image, density }: { effect: ThemeEffect; image: string | null; density: number }) {
  const pathname = usePathname();
  if (effect === "none" || pathname.startsWith("/admin")) return null;
  const n = COUNT[(Math.min(3, Math.max(1, density)) as 1 | 2 | 3)];
  const glyphs = GLYPHS[effect];
  const mode = effect === "lanterns" ? "rise" : effect === "stars" ? "twinkle" : "fall";

  return (
    <div className="bpt-fx" aria-hidden="true" data-mode={mode}>
      {Array.from({ length: n }, (_, i) => {
        const size = 14 + Math.round(rnd(i, 1) * 16);
        const style = {
          left: `${Math.round(rnd(i, 2) * 100)}%`,
          ...(mode === "twinkle" ? { top: `${Math.round(rnd(i, 6) * 92)}%` } : {}),
          fontSize: `${size}px`,
          width: image ? `${size + 10}px` : undefined,
          "--dur": `${r2((mode === "twinkle" ? 2.5 : 9) + rnd(i, 3) * (mode === "twinkle" ? 3 : 9))}s`,
          "--delay": `${r2(-rnd(i, 4) * 14)}s`,
          "--sway": `${Math.round((rnd(i, 5) - 0.5) * 120)}px`,
        } as React.CSSProperties;
        return (
          <span key={i} style={style}>
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="w-full h-auto block" loading="lazy" />
            ) : (
              glyphs[i % glyphs.length]
            )}
          </span>
        );
      })}
    </div>
  );
}
