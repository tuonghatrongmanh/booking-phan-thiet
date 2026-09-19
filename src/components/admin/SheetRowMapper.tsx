"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

type PlaceOption = { id: string; name: string; category: string };
type PreviewCell = { value: string; color: { r: number; g: number; b: number } | null };
type PreviewRow = { rowNumber: number; cells: Record<string, PreviewCell> };
type MappingRow = { placeId: string; dayColumn: string; statusColumn: string; label: string };

type PreviewData = {
  matchedSheetName: string | null;
  expectedSheetName: string;
  availableSheetNames: string[];
  columns: string[];
  rows: PreviewRow[];
  mappings: { placeId: string; dayColumn: string; statusColumn: string; label: string | null }[];
};

const CATEGORY_LABEL: Record<string, string> = { HOMESTAY: "Lưu trú", CAR_RENTAL: "Thuê xe" };

function rgbCss(color: PreviewCell["color"]) {
  if (!color) return "#ffffff";
  return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

export default function SheetRowMapper({ sourceId, places }: { sourceId: string; places: PlaceOption[] }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mappings, setMappings] = useState<MappingRow[]>([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/admin/sheet-sync/${sourceId}/rows`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Không tải được dữ liệu");
        setPreview(data);
        setMappings(
          (data.mappings as PreviewData["mappings"]).map((m) => ({
            placeId: m.placeId,
            dayColumn: m.dayColumn,
            statusColumn: m.statusColumn,
            label: m.label ?? "",
          }))
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sourceId]);

  function updateMapping(index: number, patch: Partial<MappingRow>) {
    setMappings((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  }

  function addMapping() {
    if (places.length === 0) return;
    setMappings((rows) => [...rows, { placeId: places[0].id, dayColumn: "B", statusColumn: "D", label: "" }]);
  }

  function removeMapping(index: number) {
    setMappings((rows) => rows.filter((_, i) => i !== index));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/sheet-sync/${sourceId}/mappings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mappings }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Lưu thất bại", "error");
      return;
    }
    toast(`Đã lưu ánh xạ. Bấm “Đồng bộ ngay” ở trang danh sách để áp dụng luôn.`, "success");
    router.refresh();
  }

  if (loading) return <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">Đang tải dữ liệu từ file...</div>;

  if (error || !preview) {
    return (
      <div className="bg-white rounded-2xl shadow-card p-8">
        <p className="text-brand-red font-semibold mb-2">Không đọc được dữ liệu</p>
        <p className="text-slate-500 text-sm">{error}</p>
        <p className="text-slate-400 text-xs mt-3">
          Kiểm tra: đã cấu hình GOOGLE_SHEETS_API_KEY trong .env, đã bật cả Google Sheets API và Google Drive API, và file đã chia sẻ &quot;Anyone with the link – Viewer&quot; chưa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {preview.matchedSheetName ? (
        <div className="bg-brand-sky/40 text-brand-blue text-sm font-semibold px-4 py-2.5 rounded-xl">
          Đang đọc tab: <strong>{preview.matchedSheetName}</strong>
        </div>
      ) : (
        <div className="bg-amber-50 text-amber-700 text-sm font-semibold px-4 py-2.5 rounded-xl">
          Không tìm thấy tab tên khớp &quot;{preview.expectedSheetName}&quot; — đang xem tạm tab đầu tiên. Các tab có trong file: {preview.availableSheetNames.join(", ")}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        <table className="text-xs border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-50 border border-slate-200 px-2 py-1 w-10"></th>
              {preview.columns.map((c) => (
                <th key={c} className="border border-slate-200 px-2 py-1 bg-slate-50 text-slate-500 font-bold min-w-[60px]">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.rows.map((row) => (
              <tr key={row.rowNumber}>
                <td className="sticky left-0 bg-slate-50 border border-slate-200 px-2 py-1 text-slate-400 font-bold text-center">
                  {row.rowNumber}
                </td>
                {preview.columns.map((c) => (
                  <td
                    key={c}
                    className="border border-slate-200 px-2 py-1 whitespace-nowrap max-w-[140px] overflow-hidden text-ellipsis"
                    style={{ backgroundColor: rgbCss(row.cells[c]?.color ?? null) }}
                    title={row.cells[c]?.value}
                  >
                    {row.cells[c]?.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="font-bold text-slate-700">Ánh xạ villa/xe theo cột</p>
          <button
            type="button"
            onClick={addMapping}
            disabled={places.length === 0}
            className="text-sm font-bold text-brand-blue hover:bg-brand-tint rounded-lg px-3 py-1.5 transition disabled:opacity-40"
          >
            + Thêm villa/xe
          </button>
        </div>

        {mappings.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có ánh xạ nào — bấm &quot;+ Thêm villa/xe&quot; để bắt đầu.</p>
        ) : (
          <div className="space-y-3">
            {mappings.map((m, i) => (
              <div key={i} className="grid sm:grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-2.5 items-center border border-slate-100 rounded-xl p-3">
                <select
                  value={m.placeId}
                  onChange={(e) => updateMapping(i, { placeId: e.target.value })}
                  className="border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                >
                  {places.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{CATEGORY_LABEL[p.category] ?? p.category}] {p.name}
                    </option>
                  ))}
                </select>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Cột ngày</label>
                  <select
                    value={m.dayColumn}
                    onChange={(e) => updateMapping(i, { dayColumn: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  >
                    {preview.columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-0.5">Cột trạng thái</label>
                  <select
                    value={m.statusColumn}
                    onChange={(e) => updateMapping(i, { statusColumn: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                  >
                    {preview.columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  value={m.label}
                  onChange={(e) => updateMapping(i, { label: e.target.value })}
                  placeholder="Ghi chú (vd: Góc Yên)"
                  className="border border-slate-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
                <button
                  type="button"
                  onClick={() => removeMapping(i)}
                  className="text-brand-red text-xs font-bold hover:bg-red-50 rounded-lg px-2.5 py-2"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="mt-5 bg-brand-blue text-white font-bold rounded-xl px-6 py-2.5 hover:brightness-95 transition disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu ánh xạ"}
        </button>
      </div>
    </div>
  );
}
