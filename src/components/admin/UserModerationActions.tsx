"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

const VIOLATION_TYPES = [
  "Spam / quảng cáo",
  "Ngôn từ phản cảm, thiếu văn minh",
  "Thông tin sai sự thật",
  "Nghi vấn lừa đảo",
  "Vi phạm khác",
];

function WarningModal({
  userName,
  onClose,
  onSubmit,
  submitting,
}: {
  userName: string;
  onClose: () => void;
  onSubmit: (type: string, message: string) => void;
  submitting: boolean;
}) {
  const [type, setType] = useState(VIOLATION_TYPES[0]);
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display font-bold text-lg text-slate-800">Gửi cảnh cáo</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          Gửi tới <span className="font-semibold text-slate-600">{userName}</span> — nội dung sẽ hiện ở trang tài khoản của họ.
        </p>

        <div className="mb-4">
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Loại vi phạm</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {VIOLATION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nội dung chi tiết</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Mô tả rõ hành vi vi phạm và yêu cầu đối với thành viên (càng chi tiết càng tốt để họ hiểu rõ)..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            disabled={!message.trim() || submitting}
            onClick={() => onSubmit(type, message.trim())}
            className="flex-1 bg-brand-red hover:brightness-95 transition text-white font-bold rounded-xl px-4 py-2.5 disabled:opacity-50"
          >
            {submitting ? "Đang gửi..." : "Gửi cảnh cáo"}
          </button>
          <button type="button" onClick={onClose} className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserModerationActions({
  userId,
  userName,
  hidden,
  warned,
}: {
  userId: string;
  userName: string;
  hidden: boolean;
  warned: boolean;
}) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  async function toggleHidden() {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hidden: !hidden }),
      });
      if (!res.ok) throw new Error("Không thể cập nhật");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  }

  async function submitWarning(type: string, message: string) {
    setLoading(true);
    try {
      const note = `Loại vi phạm: ${type}\n\n${message}`;
      const res = await fetch(`/api/users/${userId}/warning`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      if (!res.ok) throw new Error("Không thể gửi cảnh cáo");
      setShowModal(false);
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  }

  async function clearWarning() {
    if (!(await confirm("Gỡ cảnh cáo cho thành viên này?"))) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/warning`, { method: "DELETE" });
      if (!res.ok) throw new Error("Không thể gỡ cảnh cáo");
      router.refresh();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={toggleHidden}
        disabled={loading}
        className={`text-xs font-bold px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 ${
          hidden ? "text-brand-green bg-brand-greenBg hover:brightness-95" : "text-slate-500 bg-slate-100 hover:bg-slate-200"
        }`}
      >
        {hidden ? "Bỏ ẩn" : "Ẩn"}
      </button>
      {warned ? (
        <button
          type="button"
          onClick={clearWarning}
          disabled={loading}
          className="text-xs font-bold px-2.5 py-1.5 rounded-lg text-brand-red bg-brand-redBg hover:brightness-95 transition disabled:opacity-50"
        >
          Gỡ cảnh cáo
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="text-xs font-bold px-2.5 py-1.5 rounded-lg text-amber-600 bg-amber-50 hover:bg-amber-100 transition disabled:opacity-50"
        >
          Cảnh cáo
        </button>
      )}

      {showModal && (
        <WarningModal userName={userName} onClose={() => setShowModal(false)} onSubmit={submitWarning} submitting={loading} />
      )}
    </div>
  );
}
