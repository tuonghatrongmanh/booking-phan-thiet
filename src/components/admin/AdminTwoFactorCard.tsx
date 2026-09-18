"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

export default function AdminTwoFactorCard({ enabled: initialEnabled }: { enabled: boolean }) {
  const router = useRouter();
  const { toast } = useDialog();

  const [enabled, setEnabled] = useState(initialEnabled);
  const [setupData, setSetupData] = useState<{ secret: string; qrDataUrl: string } | null>(null);
  const [confirmToken, setConfirmToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);

  async function handleStartSetup() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/account/two-factor/setup", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    setSetupData(data);
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!setupData) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/account/two-factor/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: setupData.secret, token: confirmToken }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }
    setEnabled(true);
    setSetupData(null);
    setConfirmToken("");
    toast("Đã kích hoạt xác thực 2 lớp", "success");
    router.refresh();
  }

  async function handleDisable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/account/two-factor/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: disablePassword }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }
    setEnabled(false);
    setShowDisableForm(false);
    setDisablePassword("");
    toast("Đã tắt xác thực 2 lớp", "success");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-bold text-slate-700 flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-brand-blue" aria-hidden="true" /> Xác thực 2 lớp (2FA)
        </p>
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            enabled ? "bg-brand-greenBg text-brand-green" : "bg-slate-100 text-slate-500"
          }`}
        >
          {enabled ? "Đã bật" : "Chưa bật"}
        </span>
      </div>

      <p className="text-xs text-slate-400">
        Khi bật, mỗi lần đăng nhập sẽ cần thêm 1 mã 6 số từ ứng dụng Google Authenticator (hoặc tương tự) ngoài mật
        khẩu - giúp chặn đứng việc bị đánh cắp mật khẩu.
      </p>

      {enabled ? (
        showDisableForm ? (
          <form onSubmit={handleDisable} className="space-y-3">
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>
            {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="text-sm font-bold text-white bg-brand-red hover:brightness-95 transition rounded-lg px-4 py-2 disabled:opacity-60"
              >
                {loading ? "Đang tắt..." : "Xác nhận tắt 2FA"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDisableForm(false);
                  setError(null);
                }}
                className="text-sm font-bold text-slate-500 hover:underline"
              >
                Hủy
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowDisableForm(true)}
            className="text-sm font-bold text-brand-red border border-red-200 hover:bg-brand-redBg transition rounded-lg px-4 py-2"
          >
            Tắt 2FA
          </button>
        )
      ) : setupData ? (
        <form onSubmit={handleConfirm} className="space-y-3">
          <div className="flex flex-col items-center gap-2 bg-slate-50 rounded-xl p-4">
            <Image src={setupData.qrDataUrl} alt="QR 2FA" width={180} height={180} unoptimized className="rounded-lg" />
            <p className="text-xs text-slate-400">Hoặc nhập mã thủ công:</p>
            <code className="text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1 break-all">
              {setupData.secret}
            </code>
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nhập mã 6 số từ ứng dụng để xác nhận</label>
            <input
              type="text"
              inputMode="numeric"
              required
              maxLength={6}
              value={confirmToken}
              onChange={(e) => setConfirmToken(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="000000"
            />
          </div>
          {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading}
              className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2 disabled:opacity-60"
            >
              {loading ? "Đang xác nhận..." : "Xác nhận kích hoạt"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSetupData(null);
                setError(null);
              }}
              className="text-sm font-bold text-slate-500 hover:underline"
            >
              Hủy
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={handleStartSetup}
          disabled={loading}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2.5 disabled:opacity-60"
        >
          {loading ? "Đang tạo mã QR..." : "Kích hoạt 2FA"}
        </button>
      )}
    </div>
  );
}
