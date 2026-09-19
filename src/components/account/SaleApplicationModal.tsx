"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MediaUploader from "@/components/forum/MediaUploader";

export default function SaleApplicationModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [reason, setReason] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  const imagesOk = images.length >= 3 && images.length <= 5;

  function removeImage(url: string) {
    setImages((cur) => cur.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!imagesOk) {
      setError("Vui lòng tải lên 3-5 ảnh minh chứng (fanpage/tiktok/group).");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/sale-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, reason, dob, phone, tiktokUrl: tiktokUrl || null, images }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-card p-6 w-full max-w-lg animate-pop-in my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display font-bold text-lg text-slate-800 mb-1">Đăng ký Sale uy tín</h3>
        <p className="text-sm text-slate-400 mb-4">
          Điền thông tin và gửi ảnh minh chứng, admin sẽ xem xét và phản hồi sớm nhất.
        </p>

        {success ? (
          <>
            <p className="text-sm text-brand-green bg-brand-greenBg rounded-lg px-3 py-2 mb-4">
              Đã gửi đăng ký! Vui lòng chờ admin duyệt.
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
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Họ và tên (dùng làm tên hồ sơ Sale)</label>
              <input
                required
                minLength={3}
                maxLength={80}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Lý do đăng ký</label>
              <textarea
                required
                rows={3}
                minLength={20}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Giới thiệu về dịch vụ/sản phẩm bạn muốn quảng bá, kinh nghiệm, uy tín..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Ngày sinh</label>
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
              </div>
              <div>
                <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại</label>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                />
              </div>
            </div>

            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link TikTok (không bắt buộc)</label>
              <input
                value={tiktokUrl}
                onChange={(e) => setTiktokUrl(e.target.value)}
                placeholder="https://tiktok.com/@..."
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] text-slate-500 font-medium block">Ảnh minh chứng (fanpage/tiktok/group)</label>
                <span className={`text-xs font-bold ${imagesOk ? "text-brand-green" : "text-slate-400"}`}>{images.length}/5</span>
              </div>
              <p className="text-xs text-slate-400 mb-2">Tải lên 3-5 ảnh chụp trang fanpage, tiktok, hoặc bài đăng trong group.</p>

              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {images.map((url) => (
                    <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
                      >
                        <i className="fa-solid fa-xmark" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 5 && (
                <MediaUploader
                  folder="sale-applications"
                  multiple
                  max={5 - images.length}
                  onAdd={(item) => {
                    if (item.type === "IMAGE") setImages((cur) => [...cur, item.url]);
                  }}
                />
              )}
            </div>

            {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving || !imagesOk}
                className="flex-1 bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl py-2.5 disabled:opacity-60"
              >
                {saving ? "Đang gửi..." : "Gửi đăng ký"}
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
