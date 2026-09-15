"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

type Standing = {
  action: "SUSPENDED" | "BANNED";
  reason: string;
  suspendedUntil: string | null;
  active: boolean;
  appealText: string | null;
  appealCreatedAt: string | null;
  appealStatus: "PENDING" | "RESOLVED" | null;
  appealNote: string | null;
} | null;

export default function SaleStandingManager({ placeId, standing }: { placeId: string; standing: Standing }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [showForm, setShowForm] = useState(false);
  const [action, setAction] = useState<"SUSPENDED" | "BANNED">("SUSPENDED");
  const [reason, setReason] = useState("");
  const [suspendedUntil, setSuspendedUntil] = useState("");
  const [saving, setSaving] = useState(false);
  const [resolveNote, setResolveNote] = useState("");

  const baseUrl = `/api/admin/sale-agents/${placeId}/standing`;

  async function handleCreate() {
    if (!reason.trim()) return;
    setSaving(true);
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        reason: reason.trim(),
        suspendedUntil: action === "SUSPENDED" && suspendedUntil ? suspendedUntil : null,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      toast("Không thể áp dụng", "error");
      return;
    }
    setShowForm(false);
    setReason("");
    setSuspendedUntil("");
    toast(action === "BANNED" ? "Đã cấm Sale này" : "Đã đình chỉ Sale này", "success");
    router.refresh();
  }

  async function handleToggleActive() {
    if (!standing) return;
    const res = await fetch(baseUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !standing.active }),
    });
    if (!res.ok) {
      toast("Không thể cập nhật", "error");
      return;
    }
    router.refresh();
  }

  async function handleLift() {
    if (!(await confirm("Gỡ hoàn toàn đình chỉ/cấm cho Sale này?"))) return;
    const res = await fetch(baseUrl, { method: "DELETE" });
    if (!res.ok) {
      toast("Không thể gỡ", "error");
      return;
    }
    toast("Đã gỡ đình chỉ/cấm", "success");
    router.refresh();
  }

  async function handleResolveAppeal(approve: boolean) {
    const res = await fetch(`${baseUrl}/appeal-resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ approve, note: resolveNote.trim() || undefined }),
    });
    if (!res.ok) {
      toast("Không thể xử lý khiếu nại", "error");
      return;
    }
    setResolveNote("");
    toast(approve ? "Đã duyệt khiếu nại, gỡ đình chỉ/cấm" : "Đã từ chối khiếu nại", "success");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-ban text-brand-red" aria-hidden="true" /> Đình chỉ / Cấm
      </p>
      <p className="text-xs text-slate-400 mb-4">
        Khi đang đình chỉ/cấm, Sale sẽ thấy pop-up bắt buộc mỗi lần đăng nhập, kèm nút &quot;Khắc phục&quot; để gửi khiếu nại.
      </p>

      {standing ? (
        <div className="space-y-4">
          <div className={`rounded-xl p-4 border ${standing.action === "BANNED" ? "bg-brand-redBg border-red-200" : "bg-amber-50 border-amber-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${standing.action === "BANNED" ? "text-white bg-brand-red" : "text-white bg-amber-500"}`}>
                {standing.action === "BANNED" ? "CẤM VĨNH VIỄN" : "ĐÌNH CHỈ"}
              </span>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input type="checkbox" checked={standing.active} onChange={handleToggleActive} className="w-4 h-4" />
                Đang áp dụng
              </label>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-line">{standing.reason}</p>
            {standing.action === "SUSPENDED" && standing.suspendedUntil && (
              <p className="text-xs text-slate-500 mt-2">Đến hết: {new Date(standing.suspendedUntil).toLocaleDateString("vi-VN")}</p>
            )}
            <button onClick={handleLift} className="text-xs font-bold text-brand-blue hover:underline mt-3">
              Gỡ hoàn toàn
            </button>
          </div>

          {standing.appealStatus === "PENDING" && (
            <div className="bg-brand-sky/30 border border-sky-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-brand-blue">Khiếu nại từ Sale (đang chờ xử lý)</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">{standing.appealText}</p>
              <input
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Ghi chú phản hồi (tùy chọn)"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleResolveAppeal(true)}
                  className="text-xs font-bold text-white bg-brand-green hover:brightness-95 transition rounded-lg px-3 py-2"
                >
                  Duyệt &amp; gỡ
                </button>
                <button
                  onClick={() => handleResolveAppeal(false)}
                  className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition rounded-lg px-3 py-2"
                >
                  Từ chối, giữ nguyên
                </button>
              </div>
            </div>
          )}

          {standing.appealStatus === "RESOLVED" && standing.appealNote && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1">Đã phản hồi khiếu nại:</p>
              <p className="text-sm text-slate-600 whitespace-pre-line">{standing.appealNote}</p>
            </div>
          )}
        </div>
      ) : showForm ? (
        <div className="space-y-3 border border-slate-100 rounded-xl p-4">
          <div className="flex gap-2">
            <button
              onClick={() => setAction("SUSPENDED")}
              className={`flex-1 text-sm font-bold rounded-lg px-3 py-2 transition ${action === "SUSPENDED" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Đình chỉ
            </button>
            <button
              onClick={() => setAction("BANNED")}
              className={`flex-1 text-sm font-bold rounded-lg px-3 py-2 transition ${action === "BANNED" ? "bg-brand-red text-white" : "bg-slate-100 text-slate-500"}`}
            >
              Cấm vĩnh viễn
            </button>
          </div>
          {action === "SUSPENDED" && (
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Đình chỉ đến ngày (để trống = không xác định)</label>
              <input
                type="date"
                value={suspendedUntil}
                onChange={(e) => setSuspendedUntil(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>
          )}
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Lý do</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Mô tả rõ lý do — Sale sẽ đọc được nội dung này"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!reason.trim() || saving}
              className="flex-1 bg-brand-red hover:brightness-95 transition text-white font-bold rounded-xl px-4 py-2.5 disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Áp dụng"}
            </button>
            <button onClick={() => setShowForm(false)} className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl">
              Hủy
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="text-sm font-bold text-white bg-brand-red hover:brightness-95 transition rounded-lg px-4 py-2.5"
        >
          Đình chỉ / Cấm Sale này
        </button>
      )}
    </div>
  );
}
