"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Standing = {
  action: "SUSPENDED" | "BANNED";
  reason: string;
  suspendedUntil: string | null;
  updatedAt: string;
  appealText: string | null;
  appealStatus: "PENDING" | "RESOLVED" | null;
  appealNote: string | null;
} | null;

// Pop-up bat buoc cho Sale dang bi dinh chi/cam. KHONG dung sessionStorage "seen" -
// sessionStorage song sot qua nhieu lan dang nhap/dang xuat trong CUNG 1 tab, nen se
// khong hien lai dung "moi lan dang nhap" nhu yeu cau. Thay vao do: chi goi 1 lan khi
// component mount (khong phu thuoc pathname) - component nay mount lai moi khi co 1
// lan tai trang thuc su (vd sau khi dang nhap xong redirect ve), va KHONG mount lai
// khi chuyen trang bang Link (client-side navigation) nen khong lam phien lien tuc.
// Dong (X) chi an cho lan xem hien tai, khong luu nho gi ca.
export default function SaleStandingGate() {
  const pathname = usePathname();
  const [standing, setStanding] = useState<Standing>(null);
  const [visible, setVisible] = useState(false);
  const [appealText, setAppealText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sale-standing/me")
      .then((r) => r.json())
      .then((data: Standing) => {
        if (cancelled || !data) return;
        setStanding(data);
        setVisible(true);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAppeal() {
    if (!appealText.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/sale-standing/me/appeal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appealText: appealText.trim() }),
    });
    setSubmitting(false);
    if (res.ok) setJustSubmitted(true);
  }

  if (!standing || !visible || pathname?.startsWith("/admin")) return null;

  const hasPendingAppeal = standing.appealStatus === "PENDING" && !justSubmitted;
  const wasRejected = standing.appealStatus === "RESOLVED" && standing.appealNote;

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Đóng"
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3 mb-3">
          <span className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${standing.action === "BANNED" ? "bg-brand-redBg text-brand-red" : "bg-amber-50 text-amber-600"}`}>
            <i className="fa-solid fa-triangle-exclamation text-lg" aria-hidden="true" />
          </span>
          <p className="font-display font-bold text-lg text-slate-800">
            {standing.action === "BANNED" ? "Hồ sơ Sale đã bị cấm vĩnh viễn" : "Hồ sơ Sale đang bị đình chỉ"}
          </p>
        </div>

        <p className="text-sm text-slate-600 whitespace-pre-line mb-2">{standing.reason}</p>
        {standing.action === "SUSPENDED" && standing.suspendedUntil && (
          <p className="text-xs text-slate-400 mb-4">Đến hết ngày: {new Date(standing.suspendedUntil).toLocaleDateString("vi-VN")}</p>
        )}

        {wasRejected && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-slate-400 mb-1">Phản hồi khiếu nại trước đó:</p>
            <p className="text-sm text-slate-600 whitespace-pre-line">{standing.appealNote}</p>
          </div>
        )}

        {justSubmitted || hasPendingAppeal ? (
          <div className="bg-brand-sky/30 border border-brand-blueMid rounded-xl p-3 text-sm text-brand-blue font-semibold">
            Đã gửi khiếu nại, đang chờ SuperAdmin xem xét.
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={appealText}
              onChange={(e) => setAppealText(e.target.value)}
              rows={3}
              placeholder="Trình bày lý do bạn cho rằng quyết định này chưa hợp lý..."
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
            <button
              onClick={handleAppeal}
              disabled={!appealText.trim() || submitting}
              className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-4 py-2.5 disabled:opacity-50"
            >
              {submitting ? "Đang gửi..." : "Khắc phục — Gửi khiếu nại"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
