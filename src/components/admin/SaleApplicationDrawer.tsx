"use client";

import { createPortal } from "react-dom";
import Image from "next/image";

export type SaleApplicationDetail = {
  id: string;
  reason: string;
  dob: string;
  phone: string;
  tiktokUrl: string | null;
  status: string;
  note: string | null;
  createdAt: string;
  user: { name: string; email: string; phone: string | null };
  images: { id: string; url: string }[];
};

export default function SaleApplicationDrawer({ application, onClose }: { application: SaleApplicationDetail; onClose: () => void }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <h3 className="font-display font-bold text-lg text-slate-800">Hồ sơ đăng ký Sale uy tín</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Người đăng ký</p>
            <p className="text-sm text-slate-700">{application.user.name}</p>
            <p className="text-xs text-slate-400">{application.user.email} · {application.user.phone || "—"}</p>
          </div>

          {[
            { label: "Ngày sinh", value: new Date(application.dob).toLocaleDateString("vi-VN") },
            { label: "Số điện thoại đăng ký", value: application.phone },
            { label: "Link TikTok", value: application.tiktokUrl || "—" },
            { label: "Lý do đăng ký", value: application.reason },
          ].map((f) => (
            <div key={f.label}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
              <p className="text-sm text-slate-700 break-words whitespace-pre-wrap">{f.value}</p>
            </div>
          ))}

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-2">Ảnh minh chứng ({application.images.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {application.images.map((img) => (
                <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer" className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 block">
                  <Image src={img.url} alt="" fill className="object-cover" />
                </a>
              ))}
            </div>
          </div>

          {application.note && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Ghi chú của admin</p>
              <p className="text-sm text-slate-700">{application.note}</p>
            </div>
          )}

          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Ngày gửi</p>
            <p className="text-sm text-slate-700">{new Date(application.createdAt).toLocaleString("vi-VN")}</p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
