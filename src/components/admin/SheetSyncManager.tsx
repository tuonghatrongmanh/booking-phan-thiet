"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

type SourceItem = {
  id: string;
  name: string;
  sheetId: string;
  sheetNamePattern: string;
  lastSyncedAt: string | null;
  lastSyncError: string | null;
  mappingCount: number;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function SheetSyncManager({ initialSources }: { initialSources: SourceItem[] }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [name, setName] = useState("");
  const [sheetUrl, setSheetUrl] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  async function handleCreate() {
    setError(null);
    if (name.trim().length < 2) return setError("Vui lòng đặt tên gợi nhớ cho nguồn này");
    if (sheetUrl.trim().length < 10) return setError("Vui lòng dán link Google Sheets/Drive");

    setCreating(true);
    const res = await fetch("/api/admin/sheet-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), sheetUrl: sheetUrl.trim() }),
    });
    const data = await res.json().catch(() => ({}));
    setCreating(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }
    setName("");
    setSheetUrl("");
    router.refresh();
  }

  async function handleSync(id: string) {
    setSyncingId(id);
    const res = await fetch(`/api/admin/sheet-sync/${id}/sync`, { method: "POST" });
    setSyncingId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Đồng bộ thất bại", "error");
    } else {
      toast("Đồng bộ thành công", "success");
    }
    router.refresh();
  }

  async function handleDelete(id: string, sourceName: string) {
    if (!(await confirm({ message: `Xóa nguồn "${sourceName}"? Các homestay/xe đã đồng bộ sẽ không còn tự cập nhật nữa.`, danger: true }))) return;
    const res = await fetch(`/api/admin/sheet-sync/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Xóa thất bại", "error");
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-card p-5">
        <p className="font-bold text-slate-700 mb-3">+ Thêm nguồn đồng bộ mới</p>
        <div className="grid sm:grid-cols-[1fr_2fr_auto] gap-3 items-start">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên gợi nhớ, vd: Sheet chú Tuấn"
            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
          <input
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            placeholder="Dán link Google Sheets/Drive (https://docs.google.com/spreadsheets/d/...)"
            className="border border-slate-200 rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
          <button
            type="button"
            disabled={creating}
            onClick={handleCreate}
            className="bg-brand-blue text-white font-bold rounded-xl px-5 py-2.5 hover:brightness-95 transition disabled:opacity-50 whitespace-nowrap"
          >
            {creating ? "Đang thêm..." : "+ Thêm"}
          </button>
        </div>
        {error && <p className="text-sm text-brand-red mt-2">{error}</p>}
        <p className="text-xs text-slate-400 mt-2">
          Lưu ý: file (Google Sheets hoặc Excel .xlsx trên Drive) phải để chế độ chia sẻ &quot;Anyone with the link – Viewer&quot; thì hệ thống mới đọc được.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {initialSources.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có nguồn đồng bộ nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Tên nguồn</th>
                <th className="px-5 py-3 font-semibold">Số villa/xe đã ánh xạ</th>
                <th className="px-5 py-3 font-semibold">Đồng bộ gần nhất</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {initialSources.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-400">Mẫu tên tab: {s.sheetNamePattern}</p>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{s.mappingCount} villa/xe</td>
                  <td className="px-5 py-3">
                    {s.lastSyncError ? (
                      <span className="text-brand-red text-xs">{s.lastSyncError}</span>
                    ) : s.lastSyncedAt ? (
                      <span className="text-slate-500">{formatDateTime(s.lastSyncedAt)}</span>
                    ) : (
                      <span className="text-slate-300">Chưa đồng bộ</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                    <Link
                      href={`/admin/sheet-sync/${s.id}`}
                      className="text-brand-blue hover:bg-brand-tint rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Quản lý ánh xạ
                    </Link>
                    <button
                      type="button"
                      disabled={syncingId === s.id}
                      onClick={() => handleSync(s.id)}
                      className="text-brand-green hover:bg-brand-greenBg rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50"
                    >
                      {syncingId === s.id ? "Đang đồng bộ..." : "Đồng bộ ngay"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.name)}
                      className="text-brand-red hover:bg-red-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
