"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { emitCoinsChanged } from "@/lib/coin-fx";

type RewardItem = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  category: string;
  coinCost: number;
  stock: number | null;
};

type RedemptionHistoryItem = {
  id: string;
  status: "PENDING" | "FULFILLED" | "CANCELLED";
  coinsSpent: number;
  createdAt: string;
  note: string | null;
  recipientName: string | null;
  recipientPhone: string | null;
  addressText: string | null;
  reward: { name: string; image: string | null; category: string };
};

type View = "shop" | "checkout" | "confirm" | "history";

const STATUS_LABEL: Record<RedemptionHistoryItem["status"], string> = {
  PENDING: "Chờ xử lý",
  FULFILLED: "Đã trao thưởng",
  CANCELLED: "Đã hủy",
};
const STATUS_CLASS: Record<RedemptionHistoryItem["status"], string> = {
  PENDING: "bg-amber-50 text-amber-600",
  FULFILLED: "bg-brand-greenBg text-brand-green",
  CANCELLED: "bg-slate-100 text-slate-500",
};

function mapPreviewUrl(address: string) {
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
}

export default function CoinShopModal({
  open,
  onClose,
  avatar,
  name,
  coins,
  isLoggedIn,
}: {
  open: boolean;
  onClose: () => void;
  avatar: string;
  name: string;
  coins: number;
  isLoggedIn: boolean;
}) {
  const [view, setView] = useState<View>("shop");
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [selected, setSelected] = useState<RewardItem | null>(null);
  const [lastOrder, setLastOrder] = useState<RedemptionHistoryItem | null>(null);
  const [history, setHistory] = useState<RedemptionHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [rewardPage, setRewardPage] = useState(1);

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [addressText, setAddressText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    setView("shop");
    setSelected(null);
    setRewardPage(1);
    setError(null);
    setLoadingRewards(true);
    fetch("/api/rewards")
      .then((r) => r.json())
      .then((data: RewardItem[]) => setRewards(Array.isArray(data) ? data : []))
      .catch(() => setRewards([]))
      .finally(() => setLoadingRewards(false));
  }, [open]);


  const REWARD_PAGE_SIZE = 4;
  const totalRewardPages = Math.max(1, Math.ceil(rewards.length / REWARD_PAGE_SIZE));
  const currentRewardPage = Math.min(rewardPage, totalRewardPages);
  const pageRewards = rewards.slice((currentRewardPage - 1) * REWARD_PAGE_SIZE, currentRewardPage * REWARD_PAGE_SIZE);
  function loadHistory() {
    setLoadingHistory(true);
    fetch("/api/redemptions")
      .then((r) => r.json())
      .then((data: { items?: RedemptionHistoryItem[] }) => setHistory(data.items ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }

  function openCheckout(reward: RewardItem) {
    setSelected(reward);
    setRecipientName(name || "");
    setRecipientPhone("");
    setAddressText("");
    setError(null);
    setView("checkout");
  }

  async function submitCheckout() {
    if (!selected) return;
    setError(null);

    if (recipientName.trim().length < 2) return setError("Vui lòng nhập họ tên");
    if (!/^(0|\+84)[0-9]{9,10}$/.test(recipientPhone.trim())) return setError("Số điện thoại không hợp lệ");
    if (addressText.trim().length < 5) return setError("Vui lòng nhập địa chỉ nhận hàng");

    setSubmitting(true);
    const res = await fetch(`/api/rewards/${selected.id}/redeem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientName: recipientName.trim(),
        recipientPhone: recipientPhone.trim(),
        addressText: addressText.trim(),
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng thử lại");
      return;
    }

    emitCoinsChanged(data.newBalance);
    setLastOrder(data.redemption);
    setView("confirm");
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-3xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-b border-slate-100 bg-gradient-to-r from-brand-blue to-brand-blueLight text-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <Image
              src={avatar || "/images/avatar-world.png"}
              alt={name}
              width={44}
              height={44}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-white/70 shrink-0"
            />
            <div className="min-w-0">
              <p className="font-bold truncate">{isLoggedIn ? name : "Khách"}</p>
              <p className="text-sm text-white/90 flex items-center gap-1">
                <i className="fa-solid fa-coins text-amber-300" aria-hidden="true" />
                {coins.toLocaleString("vi-VN")} xu
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-9 h-9 shrink-0 rounded-full bg-white/15 hover:bg-white/25 transition flex items-center justify-center"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <div className="flex gap-1.5 px-5 sm:px-7 pt-3 shrink-0 border-b border-slate-100">
          {(["shop", "history"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => {
                if (v === "history") loadHistory();
                setView(v);
              }}
              className={`text-sm font-bold px-4 py-2.5 rounded-t-xl transition ${
                view === v || (v === "shop" && (view === "checkout" || view === "confirm"))
                  ? "text-brand-blue border-b-2 border-brand-blue"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {v === "shop" ? "Đổi thưởng" : "Lịch sử quy đổi"}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto p-5 sm:p-7 flex-1">
          {view === "shop" && (
            <>
              {loadingRewards ? (
                <p className="text-center text-slate-400 py-10">Đang tải...</p>
              ) : rewards.length === 0 ? (
                <p className="text-center text-slate-400 py-10">Chưa có phần thưởng nào.</p>
              ) : (
                <>
                <div className="grid sm:grid-cols-2 gap-4">
                  {pageRewards.map((r) => {
                    const canAfford = coins >= r.coinCost;
                    const outOfStock = r.stock !== null && r.stock <= 0;
                    return (
                      <div key={r.id} className="border border-slate-100 rounded-2xl overflow-hidden flex flex-col">
                        <div className="relative aspect-[4/3] bg-slate-50">
                          {r.image ? (
                            <Image src={r.image} alt={r.name} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <i className="fa-solid fa-gift text-slate-300 text-3xl" aria-hidden="true" />
                            </div>
                          )}
                          <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur text-[11px] font-bold text-slate-500 px-2.5 py-1 rounded-full">
                            {r.category}
                          </span>
                        </div>
                        <div className="p-3.5 flex flex-col flex-1">
                          <p className="font-bold text-slate-800 line-clamp-1">{r.name}</p>
                          <p className="text-xs text-slate-400 line-clamp-2 mb-3 flex-1">{r.description}</p>
                          <div className="flex items-center justify-between mb-2.5">
                            <span className="text-sm font-bold text-brand-blue flex items-center gap-1">
                              <i className="fa-solid fa-coins text-amber-400" aria-hidden="true" />
                              {r.coinCost.toLocaleString("vi-VN")}
                            </span>
                            {r.stock != null && <span className="text-[11px] text-slate-400">Còn {r.stock}</span>}
                          </div>
                          {!isLoggedIn ? (
                            <a
                              href="/dang-nhap"
                              className="text-center bg-brand-sky text-brand-blue font-bold rounded-full px-4 py-2 text-sm hover:brightness-95 transition"
                            >
                              Đăng nhập để đổi
                            </a>
                          ) : (
                            <button
                              type="button"
                              disabled={!canAfford || outOfStock}
                              onClick={() => openCheckout(r)}
                              className="bg-brand-blue text-white font-bold rounded-full px-4 py-2 text-sm hover:brightness-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {outOfStock ? "Đã hết" : canAfford ? "Đổi ngay" : "Chưa đủ xu"}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalRewardPages > 1 && (
                  <nav className="flex items-center justify-center gap-1.5 mt-5" aria-label="Phân trang">
                    <button
                      type="button"
                      onClick={() => setRewardPage((p) => Math.max(1, p - 1))}
                      disabled={currentRewardPage === 1}
                      aria-label="Trang trước"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true" />
                    </button>
                    {Array.from({ length: totalRewardPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setRewardPage(p)}
                        aria-current={p === currentRewardPage ? "page" : undefined}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                          p === currentRewardPage ? "bg-brand-blue text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setRewardPage((p) => Math.min(totalRewardPages, p + 1))}
                      disabled={currentRewardPage === totalRewardPages}
                      aria-label="Trang sau"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true" />
                    </button>
                  </nav>
                )}
                </>
              )}
            </>
          )}

          {view === "checkout" && selected && (
            <div className="max-w-lg mx-auto">
              <button type="button" onClick={() => setView("shop")} className="text-sm text-slate-400 hover:text-slate-600 mb-4">
                <i className="fa-solid fa-arrow-left mr-1.5" aria-hidden="true" /> Quay lại
              </button>

              <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3 mb-5">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-white shrink-0">
                  {selected.image ? (
                    <Image src={selected.image} alt={selected.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-gift text-slate-300" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 line-clamp-1">{selected.name}</p>
                  <p className="text-sm text-brand-blue font-bold">{selected.coinCost.toLocaleString("vi-VN")} xu</p>
                </div>
              </div>

              <p className="font-bold text-slate-700 mb-3">Thông tin nhận thưởng</p>
              <div className="space-y-3 mb-4">
                <div>
                  <label className="text-[13px] text-slate-500 font-medium mb-1 block">Họ và tên</label>
                  <input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại</label>
                  <input
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    placeholder="0913xxxxxx"
                  />
                </div>
                <div>
                  <label className="text-[13px] text-slate-500 font-medium mb-1 block">Địa chỉ nhận hàng</label>
                  <input
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                    placeholder="Số nhà, đường, phường/xã, Phan Thiết"
                  />
                </div>

                {addressText.trim().length >= 5 && (
                  <div>
                    <p className="text-[13px] text-slate-500 font-medium mb-1.5">Xác nhận vị trí trên bản đồ</p>
                    <div className="rounded-xl overflow-hidden border border-slate-200 h-[180px]">
                      <iframe
                        key={addressText}
                        src={mapPreviewUrl(addressText)}
                        className="w-full h-full border-0"
                        loading="lazy"
                        title="Xác nhận vị trí"
                      />
                    </div>
                    <p className="text-[12px] text-slate-400 mt-1.5">Kiểm tra bản đồ đúng vị trí trước khi xác nhận đổi thưởng.</p>
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-brand-red mb-3">{error}</p>}

              <button
                type="button"
                disabled={submitting}
                onClick={submitCheckout}
                className="w-full bg-brand-blue text-white font-bold rounded-full px-4 py-3 text-sm hover:brightness-95 transition disabled:opacity-50"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận đổi thưởng"}
              </button>
            </div>
          )}

          {view === "confirm" && lastOrder && (
            <div className="max-w-md mx-auto text-center py-4">
              <div className="w-16 h-16 rounded-full bg-brand-greenBg text-brand-green flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-check text-2xl" aria-hidden="true" />
              </div>
              <p className="font-display font-bold text-xl text-slate-800 mb-1">Đặt đổi thành công!</p>
              <p className="text-slate-400 mb-6">Chúng tôi sẽ liên hệ để trao thưởng cho bạn sớm nhất.</p>

              <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-1.5 mb-6">
                <p className="font-bold text-slate-800">{lastOrder.reward.name}</p>
                <p className="text-sm text-slate-500">Đã trừ {lastOrder.coinsSpent.toLocaleString("vi-VN")} xu</p>
                <p className="text-sm text-slate-500">Người nhận: {lastOrder.recipientName} — {lastOrder.recipientPhone}</p>
                <p className="text-sm text-slate-500">Địa chỉ: {lastOrder.addressText}</p>
                <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mt-1 ${STATUS_CLASS[lastOrder.status]}`}>
                  {STATUS_LABEL[lastOrder.status]}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setView("shop")}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold rounded-full px-4 py-2.5 text-sm hover:bg-slate-200 transition"
                >
                  Tiếp tục mua sắm
                </button>
                <button
                  type="button"
                  onClick={() => {
                    loadHistory();
                    setView("history");
                  }}
                  className="flex-1 bg-brand-blue text-white font-bold rounded-full px-4 py-2.5 text-sm hover:brightness-95 transition"
                >
                  Xem lịch sử
                </button>
              </div>
            </div>
          )}

          {view === "history" && (
            <>
              {loadingHistory ? (
                <p className="text-center text-slate-400 py-10">Đang tải...</p>
              ) : history.length === 0 ? (
                <p className="text-center text-slate-400 py-10">Bạn chưa có đơn đổi thưởng nào.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((h) => (
                    <div key={h.id} className="border border-slate-100 rounded-2xl p-4 flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                        {h.reward.image ? (
                          <Image src={h.reward.image} alt={h.reward.name} fill className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <i className="fa-solid fa-gift text-slate-300" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 line-clamp-1">{h.reward.name}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(h.createdAt).toLocaleDateString("vi-VN")} · {h.coinsSpent.toLocaleString("vi-VN")} xu
                        </p>
                        {h.note && <p className="text-xs text-slate-400 mt-0.5">Ghi chú: {h.note}</p>}
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_CLASS[h.status]}`}>
                        {STATUS_LABEL[h.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
