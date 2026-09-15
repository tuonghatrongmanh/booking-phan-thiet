"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import type { GameBannerSettingsData } from "@/lib/game-banner-settings";

export default function GameBannerForm({ initial }: { initial: GameBannerSettingsData }) {
  const [heroBanner, setHeroBanner] = useState(initial.heroBanner ?? "");
  const [rewardBanner, setRewardBanner] = useState(initial.rewardBanner ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/game-banner-settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroBanner, rewardBanner }),
    });

    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: "Có lỗi xảy ra, vui lòng thử lại." });
      return;
    }
    setMessage({ type: "success", text: "Đã lưu banner." });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Banner đầu trang</h2>
        <p className="text-[13px] text-slate-400">
          Ảnh nền phần đầu trang <code>/game-trung-thuong</code>. Nên dùng ảnh ngang, tối thiểu 1600×600px.
        </p>
        <ImageUploader label="Ảnh banner" value={heroBanner} onChange={setHeroBanner} folder="games" />
        <p className="text-xs text-slate-400">Để trống sẽ dùng ảnh mặc định (banner-game.png).</p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Banner &quot;Tích xu hôm nay&quot;</h2>
        <p className="text-[13px] text-slate-400">Ảnh nền banner kêu gọi chơi game ở cuối trang Game trúng thưởng.</p>
        <ImageUploader label="Ảnh banner" value={rewardBanner} onChange={setRewardBanner} folder="games" />
        <p className="text-xs text-slate-400">Để trống sẽ dùng hình minh họa mặc định (rương báu vật vẽ sẵn).</p>
      </div>

      {message && (
        <p className={`text-sm rounded-lg px-3 py-2 ${message.type === "success" ? "text-brand-green bg-brand-greenBg" : "text-brand-red bg-brand-redBg"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
