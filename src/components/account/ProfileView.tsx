"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";
import SaleApplicationModal from "@/components/account/SaleApplicationModal";

type UserInfo = {
  name: string;
  phone: string | null;
  email: string;
  dob: string | null;
  avatar: string;
  warningNote?: string | null;
  emailVerified: boolean;
};

const ICON = {
  person: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20c1.5-4 4.5-6 7.5-6s6 2 7.5 6" />
    </svg>
  ),
  phone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 8.6 8.6 0 0 0 2.7.43 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 6a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 8.6 8.6 0 0 0 .43 2.7 1 1 0 0 1-.25 1l-2.2 2.2z" />
    </svg>
  ),
  mail: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  ),
  calendar: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2.5l7.5 3.2v5.4c0 5.2-3.2 8.9-7.5 10.4-4.3-1.5-7.5-5.2-7.5-10.4V5.7L12 2.5z" />
    </svg>
  ),
  lock: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20l1.1-6.5-4.8-4.6 6.6-.9z" />
    </svg>
  ),
  pencil: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </svg>
  ),
};

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 border border-slate-100 rounded-xl px-4 py-3.5 bg-slate-50/60">
      <span className="w-9 h-9 rounded-lg bg-brand-sky text-brand-blue flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-[15px] font-semibold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function PasswordModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới nhập lại không khớp");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/users/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center px-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-card p-6 w-full max-w-sm animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display font-bold text-lg text-slate-800 mb-4">Đổi mật khẩu</h3>

        {success ? (
          <>
            <p className="text-sm text-brand-green bg-brand-greenBg rounded-lg px-3 py-2 mb-4">
              Đổi mật khẩu thành công!
            </p>
            <button
              onClick={onClose}
              className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-2.5"
            >
              Đóng
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mật khẩu mới</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-2.5 disabled:opacity-60"
              >
                {saving ? "Đang lưu..." : "Xác nhận"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="text-slate-500 font-semibold px-4 rounded-xl hover:bg-slate-50"
              >
                Hủy
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ProfileView({
  user,
  daysLeft,
  saleApplication,
}: {
  user: UserInfo;
  daysLeft: number;
  saleApplication: { status: string; note: string | null } | null;
}) {
  const router = useRouter();
  const canEdit = daysLeft <= 0;

  const [editing, setEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [email, setEmail] = useState(user.email);
  const [dob, setDob] = useState(user.dob ?? "");
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleResendVerification() {
    setResending(true);
    setResendMessage(null);
    const res = await fetch("/api/auth/send-verification-email", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setResending(false);
    if (!res.ok) {
      setResendMessage(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }
    setResendMessage(
      data.sent
        ? "Đã gửi email xác thực, hãy kiểm tra hòm thư (cả mục Spam)."
        : "Hệ thống ghi nhận yêu cầu nhưng chưa gửi được email tự động - liên hệ admin để được hỗ trợ."
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, dob, avatar }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }

    setEditing(false);
    router.refresh();
  }

  function handleCancel() {
    setName(user.name);
    setPhone(user.phone ?? "");
    setEmail(user.email);
    setDob(user.dob ?? "");
    setAvatar(user.avatar);
    setError(null);
    setEditing(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* banner */}
      <div className="relative overflow-hidden">
        <Image src="/images/banner.png" alt="" fill priority className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/50 via-brand-blue/35 to-white" />
        <div className="relative container-custom flex items-center justify-between py-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white transition-colors rounded-full pl-2.5 pr-4 py-2 text-sm font-bold text-white hover:text-brand-blue"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M11 19l-7-7 7-7M4 12h16" />
            </svg>
            Về trang chủ
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white transition-colors rounded-full px-4 py-2 text-sm font-bold text-white hover:text-brand-blue"
          >
            {ICON.lock}
            Đăng xuất
          </button>
        </div>
        <div className="h-16 sm:h-20" />
      </div>

      <div className="container-custom -mt-20 sm:-mt-24 pb-16 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start gap-5 mb-5">
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white shadow-lg shrink-0 bg-brand-sky -mt-16 sm:-mt-20">
              <Image src={editing ? avatar : user.avatar} alt={user.name} fill className="object-cover" />
              <button
                type="button"
                onClick={() => canEdit && setEditing(true)}
                disabled={!canEdit}
                title={canEdit ? "Chỉnh sửa thông tin" : `Có thể chỉnh sửa sau ${daysLeft} ngày`}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center shadow-lg ring-2 ring-white hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {ICON.pencil}
              </button>
            </div>
            <div className="pt-1 sm:pt-2 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-2xl text-slate-800">{user.name}</h1>
                <span className="flex items-center gap-1 bg-brand-sky text-brand-blue text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                  {ICON.person}
                  Thành viên
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">{user.email}</p>
            </div>
          </div>

          {user.warningNote && (
            <div className="flex items-start gap-3 bg-brand-redBg border border-red-200 text-brand-red rounded-xl px-4 py-3 mb-4">
              <i className="fa-solid fa-triangle-exclamation text-lg mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold text-sm mb-0.5">Cảnh báo từ quản trị viên</p>
                <p className="text-sm whitespace-pre-line">{user.warningNote}</p>
              </div>
            </div>
          )}

          {!user.emailVerified && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-4 py-3 mb-4">
              <i className="fa-regular fa-envelope text-lg mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <p className="font-bold text-sm mb-0.5">Email chưa được xác thực</p>
                {resendMessage ? (
                  <p className="text-sm">{resendMessage}</p>
                ) : (
                  <p className="text-sm">
                    Xác thực email để bảo mật tài khoản tốt hơn.{" "}
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="font-bold underline hover:no-underline disabled:opacity-60"
                    >
                      {resending ? "Đang gửi..." : "Gửi lại email xác thực"}
                    </button>
                  </p>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-slate-500 bg-slate-50 rounded-xl px-4 py-3 mb-6">
            👋 Chào mừng bạn quay trở lại! Cập nhật thông tin cá nhân để bảo mật tài khoản.
          </p>

          <div className="border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-brand-blue text-white flex items-center justify-center">
                {ICON.person}
              </span>
              <h2 className="font-display font-bold text-slate-800">Thông tin cá nhân</h2>
            </div>

            {!editing ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <InfoBox icon={ICON.person} label="Họ và tên" value={user.name} />
                <InfoBox icon={ICON.phone} label="Số điện thoại" value={user.phone || "Chưa cập nhật"} />
                <InfoBox icon={ICON.mail} label="Email" value={user.email} />
                <InfoBox
                  icon={ICON.calendar}
                  label="Ngày sinh"
                  value={user.dob ? new Date(user.dob).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <ImageUploader label="Ảnh đại diện" value={avatar} onChange={setAvatar} folder="avatars" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] text-slate-500 font-medium mb-1 block">Họ và tên</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] text-slate-500 font-medium mb-1 block">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    />
                  </div>
                  <div>
                    <label className="text-[13px] text-slate-500 font-medium mb-1 block">Ngày sinh</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    />
                  </div>
                </div>

                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Lưu ý: sau khi lưu, bạn phải chờ 7 ngày mới được chỉnh sửa lần tiếp theo.
                </p>

                {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-none sm:px-8 bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-3 disabled:opacity-60"
                  >
                    {saving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="text-slate-500 font-semibold px-5 rounded-xl hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* security section */}
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 mt-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-brand-sky text-brand-blue flex items-center justify-center shrink-0">
              {ICON.shield}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-slate-800">Bảo mật tài khoản</p>
              <p className="text-sm text-slate-400">
                {canEdit ? (
                  "Thông tin cá nhân có thể chỉnh sửa."
                ) : (
                  <>
                    Bạn đã chỉnh sửa gần đây. Có thể sửa lại sau <strong className="text-slate-600">{daysLeft} ngày</strong> nữa.
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-2 bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 shrink-0"
          >
            {ICON.lock}
            Đổi mật khẩu
          </button>
        </div>

        {/* noi bat section */}
        <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8 mt-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              {ICON.star}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-slate-800">Nổi bật</p>
              {!saleApplication || saleApplication.status === "REJECTED" ? (
                <p className="text-sm text-slate-400">
                  {saleApplication?.status === "REJECTED" ? (
                    <>
                      Đơn trước đã bị từ chối
                      {saleApplication.note ? <>: <span className="text-slate-600">{saleApplication.note}</span></> : null}. Bạn có thể đăng ký lại.
                    </>
                  ) : (
                    "Đăng ký để hồ sơ của bạn xuất hiện ở mục Sale uy tín trên trang chủ."
                  )}
                </p>
              ) : saleApplication.status === "PENDING" ? (
                <p className="text-sm text-amber-600 font-semibold">Đơn đăng ký đang chờ admin duyệt</p>
              ) : (
                <p className="text-sm text-brand-green font-semibold">✓ Đã được duyệt là Sale uy tín</p>
              )}
            </div>
          </div>
          {(!saleApplication || saleApplication.status === "REJECTED") && (
            <button
              onClick={() => setShowSaleModal(true)}
              className="flex items-center gap-2 bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 shrink-0"
            >
              {ICON.star}
              Đăng ký Sale uy tín
            </button>
          )}
          {saleApplication?.status === "APPROVED" && (
            <Link
              href="/tai-khoan/sale-profile"
              className="flex items-center gap-2 bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-5 py-2.5 shrink-0"
            >
              Quản lý hồ sơ Sale uy tín
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          )}
        </div>
      </div>

      {showPasswordModal && <PasswordModal onClose={() => setShowPasswordModal(false)} />}
      {showSaleModal && <SaleApplicationModal onClose={() => setShowSaleModal(false)} />}
    </div>
  );
}
