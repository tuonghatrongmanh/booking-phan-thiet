"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "bpt_saved_articles";

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Luu bai viet vao localStorage (chua can dang nhap) - tuong tu cach trang Am thuc
// luu "mon yeu thich" (bpt_food_favorites), giu nguyen quy uoc dat ten khoa cho ca site.
// compact=true: nut icon nho de nhet vao hang meta (tac gia/ngay/luot xem...) thay vi
// 1 nut to rieng - dung cho bo cuc moi khong con hang nut CTA rieng duoi mo ta.
export default function SaveArticleButton({ articleId, compact = false }: { articleId: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSaved().includes(articleId));
  }, [articleId]);

  function toggle() {
    const current = readSaved();
    const next = current.includes(articleId) ? current.filter((id) => id !== articleId) : [...current, articleId];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // localStorage khong kha dung - van doi trang thai tren UI cho phien nay
    }
    setSaved(!saved);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={saved ? "Bỏ lưu bài viết" : "Lưu bài viết"}
        title={saved ? "Đã lưu bài viết" : "Lưu bài viết"}
        className={`flex items-center gap-1.5 transition-colors ${saved ? "text-brand-blue" : "hover:text-brand-blue"}`}
      >
        <i className={saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} aria-hidden="true" />
        {saved ? "Đã lưu" : "Lưu"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`inline-flex items-center gap-2 font-bold rounded-full px-5 py-3 border-2 transition-colors ${
        saved ? "bg-brand-blue border-brand-blue text-white" : "bg-white border-slate-200 text-slate-600 hover:border-brand-blue hover:text-brand-blue"
      }`}
    >
      <i className={saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} aria-hidden="true" />
      {saved ? "Đã lưu" : "Lưu bài viết"}
    </button>
  );
}
