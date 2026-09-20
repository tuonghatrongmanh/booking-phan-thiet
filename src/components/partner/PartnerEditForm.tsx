"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import type { PartnerChange } from "@/lib/partner-schema";

type Initial = { description: string; priceFromVnd: number | null; priceHolidayVnd: number | null; phone: string; avatar: string };

// Form đối tác: chỉ gửi những trường ĐÃ ĐỔI so với hiện tại. Kết quả là 1 yêu cầu chờ admin duyệt.
export default function PartnerEditForm({ placeId, isCar, initial }: { placeId: string; isCar: boolean; initial: Initial }) {
  const router = useRouter();
  const [description, setDescription] = useState(initial.description);
  const [price, setPrice] = useState(initial.priceFromVnd?.toString() ?? "");
  const [holiday, setHoliday] = useState(initial.priceHolidayVnd?.toString() ?? "");
  const [phone, setPhone] = useState(initial.phone);
  const [avatar, setAvatar] = useState(initial.avatar);
  const [extra, setExtra] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload: PartnerChange = {};
    if (description.trim() !== initial.description.trim()) payload.description = description.trim();
    if (price.trim() !== (initial.priceFromVnd?.toString() ?? "") && price.trim() !== "") payload.priceFromVnd = Number(price);
    if (isCar && holiday.trim() !== (initial.priceHolidayVnd?.toString() ?? "") && holiday.trim() !== "") payload.priceHolidayVnd = Number(holiday);
    if (phone.trim() !== initial.phone.trim() && phone.trim() !== "") payload.phone = phone.trim();
    if (avatar && avatar !== initial.avatar) payload.avatar = avatar;
    if (extra.length > 0) payload.addImages = extra;
    if (Object.keys(payload).length === 0) return setError("Bạn chưa thay đổi gì cả.");

    setBusy(true);
    const res = await fetch("/api/partner/change-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ placeId, payload }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(typeof data.error === "string" ? data.error : "Không gửi được yêu cầu, vui lòng thử lại");
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-6 text-center">
        <i className="fa-solid fa-circle-check text-3xl mb-2" aria-hidden="true" />
        <p className="font-bold">Đã gửi yêu cầu!</p>
        <p className="text-sm">Booking Phan Thiết sẽ xem và cập nhật sớm. Bạn sẽ thấy kết quả ở mục &ldquo;Yêu cầu chỉnh sửa của tôi&rdquo;.</p>
      </div>
    );
  }

  const input = "w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40";
  const label = "text-[13px] text-slate-500 font-medium mb-1 block";
  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow-card p-5 space-y-5">
      <div>
        <label className={label}>Mô tả giới thiệu</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={3000} className={input} />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label}>Giá từ (đ / {isCar ? "ngày" : "đêm"})</label>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className={input} />
        </div>
        {isCar && (
          <div>
            <label className={label}>Giá ngày lễ (đ)</label>
            <input type="number" min={0} value={holiday} onChange={(e) => setHoliday(e.target.value)} className={input} />
          </div>
        )}
        <div>
          <label className={label}>Số điện thoại liên hệ</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="09xxxxxxxx" className={input} />
        </div>
      </div>
      <ImageUploader label="Ảnh đại diện" value={avatar} onChange={setAvatar} folder="partner" />
      <div>
        <p className={label}>Thêm ảnh vào thư viện ({extra.length}/8)</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {extra.map((u, i) => (
            <span key={u} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" className="w-20 h-20 rounded-lg object-cover" />
              <button type="button" onClick={() => setExtra(extra.filter((_, j) => j !== i))} aria-label="Bỏ ảnh" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-red text-white text-xs leading-none">×</button>
            </span>
          ))}
        </div>
        {extra.length < 8 && <ImageUploader key={extra.length} label="Chọn ảnh để thêm" value="" onChange={(u) => u && setExtra((cur) => [...cur, u])} folder="partner" />}
      </div>
      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}
      <button type="submit" disabled={busy} className="w-full bg-brand-blue text-white font-bold rounded-full py-3 disabled:opacity-50 hover:brightness-95">
        {busy ? "Đang gửi..." : "Gửi yêu cầu chỉnh sửa"}
      </button>
    </form>
  );
}
