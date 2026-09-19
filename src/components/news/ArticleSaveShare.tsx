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

// Cap nut "Luu vao danh sach" + chia se o thanh ben - cung khuon voi FoodSaveShareButtons
// cua trang Am thuc, nhung dung chung khoa luu tru bpt_saved_articles voi SaveArticleButton
// (nen luu o day hay o hang meta deu dong bo).
export default function ArticleSaveShare({ articleId, title }: { articleId: string; title: string }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // hoan sang tick ke tiep: doc localStorage chi co o client, tranh setState dong bo trong effect
    const t = setTimeout(() => setSaved(readSaved().includes(articleId)), 0);
    return () => clearTimeout(t);
  }, [articleId]);

  function toggleSave() {
    const current = readSaved();
    const next = current.includes(articleId) ? current.filter((id) => id !== articleId) : [...current, articleId];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage khong kha dung - van doi trang thai tren UI cho phien nay
    }
    setSaved(next.includes(articleId));
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // nguoi dung huy chia se
      }
      return;
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
        className="flex-1 flex items-center justify-center gap-2 h-11 rounded-full font-bold text-sm bg-food-primary text-white hover:brightness-95 transition"
      >
        <i className={saved ? "fa-solid fa-bookmark" : "fa-regular fa-bookmark"} aria-hidden="true" />
        {saved ? "Đã lưu vào danh sách" : "Lưu bài viết"}
      </button>
      <button
        type="button"
        onClick={handleShare}
        title={copied ? "Đã copy link!" : "Chia sẻ"}
        aria-label="Chia sẻ bài viết"
        className="w-11 h-11 shrink-0 rounded-full border border-[#E8EEF5] hover:bg-food-light flex items-center justify-center text-food-text transition"
      >
        <i className={copied ? "fa-solid fa-check text-brand-green" : "fa-solid fa-share-nodes"} aria-hidden="true" />
      </button>
    </div>
  );
}
