"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
};

export default function ImageUploader({ label, value, onChange, folder = "booking-phan-thiet" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload thất bại");
      }

      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-[13px] text-slate-500 font-medium mb-1 block">{label}</label>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
            <Image src={value} alt="" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300 shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-blue border border-brand-blueMid bg-brand-tint hover:bg-brand-sky rounded-lg px-3 py-2">
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
            {uploading ? "Đang tải lên..." : value ? "Đổi ảnh khác" : "Chọn ảnh"}
          </label>
          {error && <p className="text-xs text-brand-red mt-1">{error}</p>}
        </div>
      </div>
    </div>
  );
}
