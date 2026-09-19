"use client";

import { useUiSlot } from "@/components/ui/UiSlots";

export default function ScrollTopButton() {
  const customImage = useUiSlot("scroll-top");

  // Có ảnh/GIF tuỳ chỉnh (Admin > Giao diện & Lễ hội) thì ảnh THAY CẢ NÚT: bỏ nền tròn xanh
  if (customImage) {
    return (
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-4 right-4 w-14 h-14 flex items-center justify-center hover:scale-110 transition z-50"
        aria-label="Lên đầu trang"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={customImage} alt="" className="w-full h-full object-contain drop-shadow-lg select-none" />
      </button>
    );
  }

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-brand-blue text-white shadow-lg flex items-center justify-center hover:brightness-95 transition z-50"
      aria-label="Lên đầu trang"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
