"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import AdminTwoFactorCard from "./AdminTwoFactorCard";

export default function AdminAccountForm({
  name: initialName,
  email,
  twoFactorEnabled,
}: {
  name: string;
  email: string;
  twoFactorEnabled: boolean;
}) {
  const router = useRouter();
  const { toast } = useDialog();

  const [name, setName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    const res = await fetch("/api/admin/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingName(false);
    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    toast("Đã cập nhật thông tin tài khoản", "success");
    router.refresh();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới nhập lại không khớp");
      return;
    }

    setSavingPassword(true);
    const res = await fetch("/api/admin/account/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json().catch(() => ({}));
    setSavingPassword(false);

    if (!res.ok) {
      setPasswordError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }
    toast("Đã đổi mật khẩu thành công", "success");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSaveName} className="bg-white rounded-2xl shadow-card p-5 sm:p-6 space-y-4">
        <p className="font-bold text-slate-700 flex items-center gap-2">
          <i className="fa-regular fa-id-card text-brand-blue" aria-hidden="true" /> Thông tin tài khoản
        </p>

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Họ tên</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Email</label>
          <input
            value={email}
            disabled
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 text-slate-400"
          />
          <p className="text-xs text-slate-400 mt-1">Liên hệ SuperAdmin để đổi email đăng nhập.</p>
        </div>

        <button
          type="submit"
          disabled={savingName}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-5 py-2.5 disabled:opacity-60"
        >
          {savingName ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>

      <form onSubmit={handleChangePassword} className="bg-white rounded-2xl shadow-card p-5 sm:p-6 space-y-4">
        <p className="font-bold text-slate-700 flex items-center gap-2">
          <i className="fa-solid fa-lock text-brand-blue" aria-hidden="true" /> Đổi mật khẩu
        </p>

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nhập lại mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
        </div>

        {passwordError && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{passwordError}</p>}

        <button
          type="submit"
          disabled={savingPassword}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-5 py-2.5 disabled:opacity-60"
        >
          {savingPassword ? "Đang đổi..." : "Đổi mật khẩu"}
        </button>
      </form>

      <AdminTwoFactorCard enabled={twoFactorEnabled} />
    </div>
  );
}
