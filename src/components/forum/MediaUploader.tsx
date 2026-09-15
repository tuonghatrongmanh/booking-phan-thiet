"use client";

import { useState } from "react";
import { uploadFile, type MediaItem } from "@/lib/upload-client";

export type { MediaItem };

export default function MediaUploader({
  onAdd,
  folder = "forum",
  multiple = false,
  max,
  variant = "button",
}: {
  onAdd: (item: MediaItem) => void;
  folder?: string;
  multiple?: boolean;
  max?: number;
  variant?: "button" | "icon";
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    let files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;
    if (typeof max === "number") files = files.slice(0, Math.max(0, max));
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const items = await Promise.all(files.map((file) => uploadFile(file, folder)));
      items.forEach(onAdd);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setUploading(false);
    }
  }

  const input = (
    <input
      type="file"
      accept="image/*,video/*"
      multiple={multiple}
      className="hidden"
      onChange={handleFiles}
      disabled={uploading}
    />
  );

  return (
    <div>
      {variant === "icon" ? (
        <label
          className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-brand-purple transition cursor-pointer"
          aria-label="Thêm ảnh/video"
          title={uploading ? "Đang tải lên..." : "Ảnh / Video"}
        >
          {input}
          <i className={`fa-solid ${uploading ? "fa-spinner fa-spin" : "fa-photo-film"}`} aria-hidden="true" />
        </label>
      ) : (
        <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-brand-blue border border-sky-200 bg-sky-50 hover:bg-sky-100 rounded-lg px-3 py-2 transition">
          {input}
          <i className="fa-solid fa-photo-film" aria-hidden="true" />
          {uploading ? "Đang tải lên..." : "Ảnh / Video"}
        </label>
      )}
      {error && <p className="text-xs text-brand-red mt-1">{error}</p>}
    </div>
  );
}
