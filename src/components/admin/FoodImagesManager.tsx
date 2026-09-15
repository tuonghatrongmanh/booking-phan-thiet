"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";

type FoodImage = { id: string; url: string };

export default function FoodImagesManager({ foodId, images }: { foodId: string; images: FoodImage[] }) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (!newUrl) return;
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/foods/${foodId}/images`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl, sortOrder: images.length }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Không thể thêm ảnh");
      return;
    }

    setNewUrl("");
    router.refresh();
  }

  async function handleDelete(imageId: string) {
    if (!(await confirm("Xóa ảnh này?"))) return;
    await fetch(`/api/foods/${foodId}/images/${imageId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-6">
      <h2 className="font-display font-bold text-lg text-slate-800 mb-1">Gallery ảnh thực tế</h2>
      <p className="text-sm text-slate-400 mb-4">Hiển thị ở gallery lớn và tab &quot;Ảnh thực tế&quot; trên trang chi tiết món ăn.</p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-5">
        {images.map((img) => (
          <div key={img.id} className="relative group">
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100">
              <Image src={img.url} alt="" fill className="object-cover" />
            </div>
            <button
              onClick={() => handleDelete(img.id)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              title="Xóa ảnh"
            >
              ✕
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <p className="col-span-full text-sm text-slate-400">Chưa có ảnh nào.</p>
        )}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <ImageUploader label="Thêm ảnh mới" value={newUrl} onChange={setNewUrl} folder={`foods/${foodId}/images`} />
        {error && <p className="text-xs text-brand-red">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={!newUrl || saving}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Đang thêm..." : "+ Thêm vào thư viện"}
        </button>
      </div>
    </div>
  );
}
