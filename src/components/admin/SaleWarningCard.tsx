"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

export default function SaleWarningCard({
  userId,
  userName,
  warningNote,
}: {
  userId: string;
  userName: string;
  warningNote: string | null;
}) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSend() {
    if (!message.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/users/${userId}/warning`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: message.trim() }),
    });
    setSubmitting(false);
    if (!res.ok) {
      toast("Không thể gửi cảnh cáo", "error");
      return;
    }
    setShowModal(false);
    setMessage("");
    toast("Đã gửi cảnh cáo", "success");
    router.refresh();
  }

  async function handleClear() {
    if (!(await confirm("Gỡ cảnh cáo cho tài khoản này?"))) return;
    const res = await fetch(`/api/users/${userId}/warning`, { method: "DELETE" });
    if (!res.ok) {
      toast("Không thể gỡ cảnh cáo", "error");
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-triangle-exclamation text-amber-500" aria-hidden="true" /> Cảnh cáo riêng tư
      </p>
      <p className="text-xs text-slate-400 mb-4">Chỉ tài khoản này thấy được (hiện ở trang tài khoản của họ).</p>

      {warningNote ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <p className="text-sm text-slate-600 whitespace-pre-line">{warningNote}</p>
          <button onClick={handleClear} className="text-xs font-bold text-brand-red hover:underline">
            Gỡ cảnh cáo
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowModal(true)}
          className="text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 transition rounded-lg px-4 py-2.5"
        >
          Gửi cảnh cáo
        </button>
      )}

      {showModal && (
        <div className="fixed inset-0 z-[150] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <p className="font-bold text-slate-800 mb-1">Gửi cảnh cáo</p>
            <p className="text-sm text-slate-400 mb-4">
              Gửi tới <span className="font-semibold text-slate-600">{userName}</span> — chỉ tài khoản này thấy được.
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Mô tả rõ vi phạm hoặc yêu cầu đối với Sale này..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40 mb-4"
            />
            <div className="flex gap-3">
              <button
                disabled={!message.trim() || submitting}
                onClick={handleSend}
                className="flex-1 bg-amber-500 hover:brightness-95 transition text-white font-bold rounded-xl px-4 py-2.5 disabled:opacity-50"
              >
                {submitting ? "Đang gửi..." : "Gửi cảnh cáo"}
              </button>
              <button onClick={() => setShowModal(false)} className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
