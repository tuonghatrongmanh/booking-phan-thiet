"use client";

import { useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import ThemeMock from "@/components/admin/ThemeMock";
import { useDialog } from "@/components/ui/DialogProvider";
import { contrastWithWhite, isHex } from "@/lib/theme-colors";

export type ThemeRow = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  builtin: boolean;
  primary: string;
  secondary: string | null;
  footerColor: string | null;
  heroOverlay: string | null;
  heroOverlayOpacity: number;
  previewImage: string | null;
  heroImage: string | null;
  headerImage: string | null;
  footerImage: string | null;
};

type Form = Omit<ThemeRow, "id" | "key" | "builtin">;

const EMPTY_FORM: Form = {
  name: "",
  description: "",
  primary: "#0a5c36",
  secondary: null,
  footerColor: null,
  heroOverlay: null,
  heroOverlayOpacity: 0,
  previewImage: null,
  heroImage: null,
  headerImage: null,
  footerImage: null,
};

function ColorField({
  label,
  value,
  onChange,
  optional = false,
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  optional?: boolean;
  hint?: string;
}) {
  const valid = value !== null && isHex(value);
  return (
    <div>
      <label className="text-[13px] text-slate-500 font-medium mb-1 block">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={valid ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-11 h-10 rounded-lg border border-slate-200 bg-white p-1 cursor-pointer"
          aria-label={label}
        />
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value.trim() || null)}
          placeholder={optional ? "Tự động" : "#rrggbb"}
          maxLength={7}
          className="w-28 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
        />
        {optional && value && (
          <button type="button" onClick={() => onChange(null)} className="text-xs text-slate-400 hover:text-slate-600 underline">
            Bỏ chọn
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-slate-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function ThemeManager({ initialThemes, initialActiveKey }: { initialThemes: ThemeRow[]; initialActiveKey: string }) {
  const { confirm, toast } = useDialog();
  const [themes, setThemes] = useState(initialThemes);
  const [activeKey, setActiveKey] = useState(initialActiveKey);
  const [selectedKey, setSelectedKey] = useState(initialActiveKey);
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null);
  const [busy, setBusy] = useState(false);

  const selected = themes.find((t) => t.key === selectedKey);
  const active = themes.find((t) => t.key === activeKey);

  async function activate() {
    if (!selected || selected.key === activeKey) return;
    const ok = await confirm({
      title: `Áp dụng giao diện “${selected.name}”?`,
      message:
        "Màu sắc, ảnh hero/header/footer của TOÀN BỘ website sẽ đổi ngay cho mọi khách truy cập (khách thấy ở lần tải trang kế tiếp). " +
        "Bạn có thể chuyển lại bất cứ lúc nào.",
      confirmText: "Áp dụng cho toàn site",
    });
    if (!ok) return;
    setBusy(true);
    const res = await fetch("/api/admin/themes/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: selected.key }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(data.error || "Không áp dụng được giao diện", "error");
      return;
    }
    setActiveKey(selected.key);
    toast(`Đã áp dụng giao diện “${selected.name}”`, "success");
  }

  async function save() {
    if (!editing) return;
    const { id, form } = editing;
    setBusy(true);
    const res = await fetch(id ? `/api/admin/themes/${id}` : "/api/admin/themes", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(data.error || "Không lưu được giao diện", "error");
      return;
    }
    setThemes((cur) => (id ? cur.map((t) => (t.id === id ? data : t)) : [...cur, data]));
    if (!id) setSelectedKey(data.key);
    setEditing(null);
    toast(id && data.key === activeKey ? "Đã lưu - khách sẽ thấy thay đổi ngay" : "Đã lưu giao diện", "success");
  }

  async function remove(t: ThemeRow) {
    const ok = await confirm({ title: "Xóa giao diện?", message: `Xóa giao diện “${t.name}”? Không thể hoàn tác.`, confirmText: "Xóa", danger: true });
    if (!ok) return;
    const res = await fetch(`/api/admin/themes/${t.id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast(data.error || "Không xóa được", "error");
      return;
    }
    setThemes((cur) => cur.filter((x) => x.id !== t.id));
    if (selectedKey === t.key) setSelectedKey(activeKey);
    toast("Đã xóa giao diện", "success");
  }

  function startEdit(t: ThemeRow) {
    const { id, key, builtin, ...form } = t;
    void key;
    void builtin;
    setEditing({ id, form });
  }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setEditing((e) => (e ? { ...e, form: { ...e.form, [k]: v } } : e));

  const f = editing?.form;
  const primaryWarn = f && isHex(f.primary) && contrastWithWhite(f.primary) < 4.5;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[220px]">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Đang áp dụng cho khách</p>
          <p className="font-display font-bold text-xl text-slate-800">{active?.name ?? "Mặc định"}</p>
          <p className="text-sm text-slate-500">
            Chọn một giao diện bên dưới rồi bấm “Áp dụng”. Màu sắc, ảnh hero/header/footer của toàn website đổi theo.
          </p>
        </div>
        <button
          type="button"
          onClick={activate}
          disabled={busy || !selected || selected.key === activeKey}
          className="bg-brand-blue text-white font-bold rounded-full px-6 py-3 disabled:opacity-40 hover:brightness-95 transition"
        >
          {selected && selected.key !== activeKey ? `Áp dụng “${selected.name}”` : "Chọn giao diện để áp dụng"}
        </button>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {themes.map((t) => {
          const isSel = t.key === selectedKey;
          const isActive = t.key === activeKey;
          return (
            <div
              key={t.id}
              className={`bg-white rounded-2xl border-2 shadow-card overflow-hidden flex flex-col transition ${
                isSel ? "border-brand-blue" : "border-slate-100"
              }`}
            >
              <button type="button" onClick={() => setSelectedKey(t.key)} className="text-left p-3 pb-0" aria-pressed={isSel}>
                {t.previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.previewImage} alt={`Xem trước ${t.name}`} className="w-full aspect-[16/10] object-cover rounded-xl border border-slate-200" />
                ) : (
                  <ThemeMock theme={t} isDefault={t.key === "default"} />
                )}
              </button>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer font-display font-bold text-slate-800">
                    <input type="radio" name="theme" checked={isSel} onChange={() => setSelectedKey(t.key)} className="accent-[var(--theme-primary)] w-4 h-4" />
                    {t.name}
                  </label>
                  {isActive && <span className="text-[11px] font-bold text-white bg-brand-green rounded-full px-2 py-0.5">Đang áp dụng</span>}
                  {t.builtin && <span className="text-[11px] font-bold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">Có sẵn</span>}
                </div>
                {t.description && <p className="text-sm text-slate-500 mb-3 flex-1">{t.description}</p>}
                <div className="flex items-center gap-2 mb-3">
                  {[t.primary, t.secondary, t.footerColor].filter((c): c is string => Boolean(c)).map((c) => (
                    <span key={c} title={c} className="w-6 h-6 rounded-full border border-slate-200" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  {t.key !== "default" && (
                    <button type="button" onClick={() => startEdit(t)} className="text-sm font-semibold text-brand-blue border border-brand-blueMid rounded-full px-4 py-1.5 hover:bg-brand-tint">
                      Chỉnh sửa
                    </button>
                  )}
                  {!t.builtin && !isActive && (
                    <button type="button" onClick={() => remove(t)} className="text-sm font-semibold text-brand-red hover:underline">
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => setEditing({ id: null, form: { ...EMPTY_FORM } })}
          className="min-h-[220px] rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 hover:text-brand-blue hover:border-brand-blue flex flex-col items-center justify-center gap-2 font-semibold transition"
        >
          <i className="fa-solid fa-plus text-2xl" aria-hidden="true" />
          Thêm giao diện mới (Giáng sinh, 30/4...)
        </button>
      </div>

      {editing && f && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-slate-800">{editing.id ? "Chỉnh sửa giao diện" : "Thêm giao diện mới"}</h2>
            <button type="button" onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-600" aria-label="Đóng">
              <i className="fa-solid fa-xmark" aria-hidden="true" />
            </button>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên giao diện</label>
                <input
                  value={f.name}
                  onChange={(e) => set("name", e.target.value)}
                  maxLength={60}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả ngắn</label>
                <textarea
                  value={f.description ?? ""}
                  onChange={(e) => set("description", e.target.value)}
                  rows={2}
                  maxLength={400}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <ColorField label="Màu chủ đạo (nút, tiêu đề, header)" value={f.primary} onChange={(v) => set("primary", v ?? "")} hint="Các sắc đậm/nhạt còn lại tự tính từ màu này." />
                <ColorField label="Màu cuối dải header (tuỳ chọn)" value={f.secondary} onChange={(v) => set("secondary", v)} optional hint="Vd vàng mai cho Tết." />
                <ColorField label="Màu nền footer (tuỳ chọn)" value={f.footerColor} onChange={(v) => set("footerColor", v)} optional />
                <ColorField label="Màu phủ lên ảnh hero (tuỳ chọn)" value={f.heroOverlay} onChange={(v) => set("heroOverlay", v)} optional />
              </div>
              {primaryWarn && <p className="text-xs text-brand-red">Màu chủ đạo quá sáng: chữ trắng trên nút sẽ khó đọc, hệ thống sẽ không cho lưu.</p>}

              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Độ đậm lớp phủ hero: {f.heroOverlayOpacity}%</label>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={f.heroOverlayOpacity}
                  onChange={(e) => set("heroOverlayOpacity", Number(e.target.value))}
                  className="w-full accent-[var(--theme-primary)]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <ImageUploader label="Ảnh xem trước (bạn thiết kế)" value={f.previewImage ?? ""} onChange={(u) => set("previewImage", u)} folder="themes" />
                <ImageUploader label="Ảnh nền hero trang chủ" value={f.heroImage ?? ""} onChange={(u) => set("heroImage", u)} folder="themes" />
                <ImageUploader label="Ảnh nền header" value={f.headerImage ?? ""} onChange={(u) => set("headerImage", u)} folder="themes" />
                <ImageUploader label="Ảnh nền footer" value={f.footerImage ?? ""} onChange={(u) => set("footerImage", u)} folder="themes" />
              </div>
              <p className="text-xs text-slate-400">
                Ảnh hero nên rộng ~1920x800px; ảnh header ~1920x100px (họa tiết hoa mai, đèn lồng...); ảnh footer ~1920x400px. Để trống = dùng ảnh mặc định.
              </p>
            </div>

            <div>
              <p className="text-[13px] text-slate-500 font-medium mb-2">Xem trước trực tiếp</p>
              <ThemeMock theme={{ ...f, primary: isHex(f.primary) ? f.primary : "#003b95" }} />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button type="button" onClick={save} disabled={busy} className="bg-brand-blue text-white font-bold rounded-full px-6 py-2.5 disabled:opacity-50 hover:brightness-95 transition">
              {busy ? "Đang lưu..." : "Lưu giao diện"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-700">
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
