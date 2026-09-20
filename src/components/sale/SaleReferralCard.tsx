"use client";

import { useState } from "react";
import type { SaleReferralData } from "@/lib/sale-referral-data";

const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;
const STATUS = { PENDING: ["Chờ trả", "bg-amber-100 text-amber-700"], PAID: ["Đã trả", "bg-emerald-100 text-emerald-700"], CANCELLED: ["Đơn đã hủy", "bg-slate-100 text-slate-500"] } as const;

// Tab "Giới thiệu & hoa hồng": link riêng có mã, số đơn, hoa hồng chờ trả/đã trả, bảng xếp hạng tháng này.
export default function SaleReferralCard({ data }: { data: SaleReferralData }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(data.link);
    } catch {
      const el = document.getElementById("sale-ref-link") as HTMLInputElement | null;
      el?.select();
      document.execCommand("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <p className="font-bold text-slate-800 mb-1">Link giới thiệu của bạn</p>
        <p className="text-sm text-slate-500 mb-3">
          Gửi link này cho khách. Khách đặt phòng/thuê xe qua link và <b>đã đặt cọc thành công</b> thì bạn nhận <b className="text-brand-blue">{data.percent}% tiền cọc</b> làm hoa hồng (link ghi nhớ 30 ngày trên máy khách). Lượt bấm tính 1 lần mỗi ngày cho mỗi thiết bị.
        </p>
        <div className="flex gap-2">
          <input id="sale-ref-link" readOnly value={data.link} onFocus={(e) => e.currentTarget.select()} className="flex-1 min-w-0 border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-slate-50 font-mono" />
          <button type="button" onClick={copy} className="shrink-0 bg-brand-blue text-white font-bold rounded-xl px-4 text-sm hover:brightness-95">
            {copied ? "Đã chép ✓" : "Sao chép"}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Mã của bạn: <b className="font-mono text-slate-600">{data.code}</b></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          ["Lượt bấm link (30 ngày)", String(data.visits30), "fa-solid fa-computer-mouse"],
          ["Tỉ lệ chốt đơn", data.conversionPercent === null ? "—" : `${data.conversionPercent}%`, "fa-solid fa-bullseye"],
          ["Đơn qua link", String(data.referredOrders), "fa-solid fa-link"],
          ["Đơn đã cọc", String(data.paidOrders), "fa-solid fa-circle-check"],
          ["Hoa hồng chờ trả", vnd(data.pendingAmount), "fa-solid fa-hourglass-half"],
          ["Đã nhận", vnd(data.paidAmount), "fa-solid fa-sack-dollar"],
        ].map(([label, value, icon]) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-slate-100 min-w-0">
            <p className="text-xs font-semibold text-slate-500 mb-1"><i className={`${icon} mr-1.5 text-brand-blue`} aria-hidden="true" />{label}</p>
            <p className="font-display font-extrabold text-lg text-slate-800 break-words">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <p className="font-bold text-slate-800 mb-3">Hoa hồng gần đây</p>
        {data.items.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có đơn nào đã cọc qua link của bạn. Hãy chia sẻ link lên Zalo, Facebook, TikTok...</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.items.map((it) => (
              <li key={it.id} className="py-2.5 flex items-center gap-3 text-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-700 truncate">{it.placeName}</p>
                  <p className="text-xs text-slate-400">{it.customer} · {new Date(it.createdAt).toLocaleDateString("vi-VN")} · cọc {vnd(it.depositAmount)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-800">+{vnd(it.amount)}</p>
                  <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${STATUS[it.status][1]}`}>{STATUS[it.status][0]}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-slate-100">
        <p className="font-bold text-slate-800 mb-1">Bảng xếp hạng tháng này</p>
        <p className="text-xs text-slate-400 mb-3">Theo số đơn đã cọc qua link giới thiệu. {data.myRank ? `Bạn đang hạng ${data.myRank}.` : "Bạn chưa có đơn nào trong tháng."}</p>
        {data.leaderboard.length === 0 ? (
          <p className="text-sm text-slate-400">Chưa có ai có đơn trong tháng này - hãy là người đầu tiên!</p>
        ) : (
          <ol className="space-y-2">
            {data.leaderboard.map((l, i) => (
              <li key={l.placeId} className={`flex items-center gap-3 text-sm rounded-xl px-3 py-2 ${l.isMe ? "bg-brand-tint" : ""}`}>
                <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="flex-1 truncate font-semibold text-slate-700">{l.name}{l.isMe ? " (bạn)" : ""}</span>
                <span className="text-slate-500 shrink-0">{l.orders} đơn</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
