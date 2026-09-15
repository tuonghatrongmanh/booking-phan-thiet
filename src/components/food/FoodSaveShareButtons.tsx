"use client";

import { useEffect, useState } from "react";

const FAVORITES_KEY = "bpt_food_favorites";

export default function FoodSaveShareButtons({ foodId, name }: { foodId: string; name: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      setSaved(ids.includes(foodId));
    } catch {
      // ignore corrupted storage
    }
  }, [foodId]);

  function toggleSave() {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      const ids: string[] = raw ? JSON.parse(raw) : [];
      const next = ids.includes(foodId) ? ids.filter((id) => id !== foodId) : [...ids, foodId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      setSaved(next.includes(foodId));
    } catch {
      // storage unavailable - bo qua, khong chan trai nghiem
    }
  }

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
        return;
      } catch {
        // nguoi dung huy chia se - khong lam gi them
        return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard khong kha dung - bo qua
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={toggleSave}
        className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-full font-bold text-sm transition ${
          saved ? "bg-food-primary text-white" : "bg-food-primary text-white hover:brightness-95"
        }`}
      >
        <i className={saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} aria-hidden="true" />
        {saved ? "Đã lưu vào danh sách" : "Lưu vào danh sách"}
      </button>
      <button
        type="button"
        onClick={handleShare}
        title={copied ? "Đã copy link!" : "Chia sẻ"}
        className="w-11 h-11 shrink-0 rounded-full border border-[#E8EEF5] hover:bg-food-light flex items-center justify-center text-food-text transition"
      >
        <i className={copied ? "fa-solid fa-check text-brand-green" : "fa-solid fa-share-nodes"} aria-hidden="true" />
      </button>
    </div>
  );
}
