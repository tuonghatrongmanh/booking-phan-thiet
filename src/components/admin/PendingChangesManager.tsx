"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";

type Item = {
  id: string;
  action: string;
  actionLabel: string;
  targetType: string;
  targetLabel: string;
  requestedByName: string;
  requestedByEmail: string;
  createdAt: string;
};

const TARGET_TYPE_LABEL: Record<string, string> = {
  Place: "Homestay/Xe/Địa điểm",
  Food: "Món ăn",
  StayArea: "Khu vực",
  StayAmenity: "Tiện ích",
  StayTypeSetting: "Danh mục chỗ ở",
  LocalSpecialty: "Đặc sản",
  FoodCategory: "Danh mục món ăn",
  LuuTruPageSettings: "Cài đặt trang Lưu trú",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const ACTION_BADGE: Record<string, string> = {
  DELETE: "bg-brand-redBg text-brand-red",
  HIDE: "bg-amber-50 text-amber-600",
  UPDATE: "bg-brand-sky text-brand-blue",
};

export default function PendingChangesManager({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleApprove(id: string, label: string) {
    if (!(await confirm({ message: `Duyệt yêu cầu "${label}"? Thay đổi sẽ được áp dụng ngay lên website công khai.` }))) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/pending-changes/${id}/approve`, { method: "POST" });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Duyệt thất bại", "error");
      return;
    }
    toast("Đã duyệt và áp dụng thay đổi", "success");
    router.refresh();
  }

  async function handleReject(id: string, label: string) {
    if (!(await confirm({ message: `Từ chối yêu cầu "${label}"?`, danger: true }))) return;
    setBusyId(id);
    const res = await fetch(`/api/admin/pending-changes/${id}/reject`, { method: "POST" });
    setBusyId(null);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    toast("Đã từ chối yêu cầu", "success");
    router.refresh();
  }

  if (initialItems.length === 0) {
    return <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-400">Không có yêu cầu nào đang chờ duyệt.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
      <table className="w-full text-sm min-w-[820px]">
        <thead className="bg-slate-50 text-slate-500 text-left">
          <tr>
            <th className="px-5 py-3 font-semibold">Hành động</th>
            <th className="px-5 py-3 font-semibold">Đối tượng</th>
            <th className="px-5 py-3 font-semibold">Người yêu cầu</th>
            <th className="px-5 py-3 font-semibold">Thời gian</th>
            <th className="px-5 py-3 font-semibold text-right">Xử lý</th>
          </tr>
        </thead>
        <tbody>
          {initialItems.map((item) => (
            <tr key={item.id} className="border-t border-slate-100">
              <td className="px-5 py-3">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${ACTION_BADGE[item.action] ?? "bg-slate-100 text-slate-500"}`}>
                  {item.actionLabel}
                </span>
              </td>
              <td className="px-5 py-3">
                <p className="font-semibold text-slate-800">{item.targetLabel}</p>
                <p className="text-xs text-slate-400">{TARGET_TYPE_LABEL[item.targetType] ?? item.targetType}</p>
              </td>
              <td className="px-5 py-3">
                <p className="text-slate-700">{item.requestedByName}</p>
                <p className="text-xs text-slate-400">{item.requestedByEmail}</p>
              </td>
              <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDateTime(item.createdAt)}</td>
              <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleApprove(item.id, item.targetLabel)}
                  className="text-brand-green hover:bg-brand-greenBg rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50"
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  disabled={busyId === item.id}
                  onClick={() => handleReject(item.id, item.targetLabel)}
                  className="text-brand-red hover:bg-red-50 rounded-lg px-2.5 py-1.5 text-xs font-bold transition disabled:opacity-50"
                >
                  Từ chối
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
