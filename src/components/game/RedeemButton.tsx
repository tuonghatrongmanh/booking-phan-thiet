"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import { emitCoinsChanged } from "@/lib/coin-fx";

export default function RedeemButton({
  rewardId,
  rewardName,
  coinCost,
  isLoggedIn,
  canAfford,
}: {
  rewardId: string;
  rewardName: string;
  coinCost: number;
  isLoggedIn: boolean;
  canAfford: boolean;
}) {
  const router = useRouter();
  const { confirm } = useDialog();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleRedeem() {
    if (!(await confirm(`Đổi "${rewardName}" với ${coinCost.toLocaleString("vi-VN")} xu?`))) return;
    setLoading(true);
    setMessage(null);

    const res = await fetch(`/api/rewards/${rewardId}/redeem`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setMessage(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }

    setMessage("Đã ghi nhận! Chúng tôi sẽ liên hệ để trao thưởng cho bạn sớm nhất.");
    emitCoinsChanged(data.newBalance);
    router.refresh();
  }

  if (!isLoggedIn) {
    return (
      <a
        href="/dang-nhap?callbackUrl=/game-trung-thuong"
        className="block text-center bg-brand-sky text-brand-blue font-bold rounded-full px-4 py-2 text-sm hover:brightness-95 transition"
      >
        Đăng nhập để đổi
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleRedeem}
        disabled={loading || !canAfford}
        className="w-full bg-brand-blue text-white font-bold rounded-full px-4 py-2 text-sm hover:brightness-95 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Đang xử lý..." : canAfford ? "Đổi ngay" : "Chưa đủ xu"}
      </button>
      {message && <p className="text-xs text-slate-500 mt-2">{message}</p>}
    </div>
  );
}
