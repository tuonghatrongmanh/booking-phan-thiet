"use client";

import { useState } from "react";
import { useDialog } from "@/components/ui/DialogProvider";

export default function PasswordResetRequestRow({
  id,
  name,
  email,
  phone,
  createdAtLabel,
}: {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAtLabel: string;
}) {
  const { toast } = useDialog();
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  async function handleResolve() {
    setLoading(true);
    const res = await fetch(`/api/admin/password-reset-requests/${id}/resolve`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    setNewPassword(data.newPassword);
  }

  async function copyPassword() {
    if (!newPassword) return;
    try {
      await navigator.clipboard.writeText(newPassword);
      toast("Đã sao chép mật khẩu mới", "success");
    } catch {
      toast("Không thể sao chép, hãy chọn thủ công", "error");
    }
  }

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="px-5 py-3">
        <p className="font-semibold text-slate-800">{name}</p>
        <p className="text-xs text-slate-400">{email}</p>
        {phone && <p className="text-xs text-slate-400">{phone}</p>}
      </td>
      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{createdAtLabel}</td>
      <td className="px-5 py-3">
        {newPassword ? (
          <div className="flex items-center gap-2">
            <code className="font-mono text-sm font-bold text-slate-800 bg-brand-sky/30 rounded-lg px-2.5 py-1.5 border border-brand-blueMid">
              {newPassword}
            </code>
            <button type="button" onClick={copyPassword} className="text-xs font-bold text-brand-blue hover:underline">
              Sao chép
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResolve}
            disabled={loading}
            className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2 disabled:opacity-60"
          >
            {loading ? "Đang tạo..." : "Tạo mật khẩu tạm"}
          </button>
        )}
      </td>
    </tr>
  );
}
