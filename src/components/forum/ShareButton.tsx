"use client";

import { useState } from "react";

export default function ShareButton({ path, className }: { path: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(window.location.origin + path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // im lặng bỏ qua nếu trình duyệt chặn quyền clipboard
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={className ?? "flex items-center gap-1 pointer-events-auto hover:text-brand-blue transition"}
    >
      <i className="fa-solid fa-share-nodes" aria-hidden="true" />
      {copied ? "Đã sao chép" : "Chia sẻ"}
    </button>
  );
}
