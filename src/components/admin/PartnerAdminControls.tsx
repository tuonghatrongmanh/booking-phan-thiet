"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

// Duyệt / từ chối yêu cầu chỉnh sửa của đối tác (có ô ghi chú gửi lại cho họ)
export function RequestActions({ id }: { id: string }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(action: "approve" | "reject") {
    const ok = await confirm({
      title: action === "approve" ? "Duyệt và áp dụng thay đổi?" : "Từ chối yêu cầu này?",
      message: action === "approve" ? "Các thay đổi sẽ được cập nhật lên website ngay." : "Đối tác sẽ thấy ghi chú của bạn (nếu có).",
      confirmText: action === "approve" ? "Duyệt & áp dụng" : "Từ chối",
      danger: action === "reject",
    });
    if (!ok) return;
    setBusy(true);
    const res = await fetch(`/api/admin/partner-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, note }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(typeof data.error === "string" ? data.error : "Không xử lý được", "error");
    toast(action === "approve" ? "Đã duyệt và cập nhật" : "Đã từ chối", "success");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} placeholder="Ghi chú gửi đối tác (tùy chọn)" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30" />
      <div className="flex gap-2">
        <button type="button" disabled={busy} onClick={() => act("approve")} className="bg-brand-blue text-white font-bold rounded-full px-5 py-2 text-sm disabled:opacity-50 hover:brightness-95">Duyệt &amp; áp dụng</button>
        <button type="button" disabled={busy} onClick={() => act("reject")} className="text-brand-red font-bold rounded-full px-4 py-2 text-sm border border-red-200 hover:bg-brand-redBg disabled:opacity-50">Từ chối</button>
      </div>
    </div>
  );
}

// Gán / gỡ tài khoản đối tác cho 1 homestay hoặc xe (nhập email đối tác đã đăng ký trên website)
export function PlaceOwnerPanel({ placeId, current }: { placeId: string; current: { name: string; email: string } | null }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(next: string | null) {
    setBusy(true);
    const res = await fetch(`/api/admin/places/${placeId}/partner`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: next }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return toast(typeof data.error === "string" ? data.error : "Không lưu được", "error");
    toast(next ? "Đã gán đối tác" : "Đã gỡ đối tác", "success");
    setEmail("");
    router.refresh();
  }

  return (
    <section className="bg-white rounded-2xl shadow-card p-5 space-y-3">
      <div>
        <h2 className="font-display font-bold text-lg text-slate-800">Đối tác quản lý</h2>
        <p className="text-sm text-slate-500">Người được gán vào đây đăng nhập website sẽ thấy <b>Cổng đối tác</b>: xem đơn + lịch của chỗ này (kể cả tên và số điện thoại khách). Họ chỉ được đề xuất sửa giá/mô tả/ảnh, bạn duyệt mới áp dụng.</p>
      </div>
      {current ? (
        <div className="flex flex-wrap items-center gap-3 bg-brand-tint rounded-xl px-4 py-3">
          <p className="flex-1 min-w-0 text-sm"><b className="text-slate-800">{current.name}</b> <span className="text-slate-500">· {current.email}</span></p>
          <button type="button" disabled={busy} onClick={() => save(null)} className="text-sm font-bold text-brand-red hover:underline disabled:opacity-50">Gỡ</button>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Chưa gán đối tác nào.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email tài khoản của đối tác" className="flex-1 min-w-[220px] border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40" />
        <button type="button" disabled={busy || !email.includes("@")} onClick={() => save(email)} className="bg-brand-blue text-white font-bold rounded-xl px-5 text-sm disabled:opacity-50 hover:brightness-95">{current ? "Đổi sang người này" : "Gán đối tác"}</button>
      </div>
    </section>
  );
}
