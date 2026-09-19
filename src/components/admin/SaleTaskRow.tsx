"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE, type SaleTaskStatus } from "@/lib/sale-tasks";

export type AdminTask = {
  id: string;
  status: SaleTaskStatus;
  title: string | null;
  description: string | null;
  bonusPoints: number;
  saleNote: string | null;
  adminNote: string | null;
  updatedAt: string;
  place: { id: string; name: string; avatar: string | null; salePoints: number };
};

const INPUT = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30";
const BTN = "text-sm font-bold rounded-lg px-4 py-2 disabled:opacity-50 transition";

export default function SaleTaskRow({ task }: { task: AdminTask }) {
  const router = useRouter();
  const { toast, confirm } = useDialog();
  const [title, setTitle] = useState(task.title ?? "");
  const [description, setDescription] = useState(task.description ?? "");
  const [bonus, setBonus] = useState(task.bonusPoints);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function act(action: "assign" | "return" | "approve" | "reject") {
    if (action === "reject" && !(await confirm({ title: "Từ chối nhiệm vụ?", message: "Nhiệm vụ sẽ đóng lại, không cộng điểm.", confirmText: "Từ chối", danger: true }))) return;
    setBusy(true);
    const res = await fetch(`/api/admin/sale-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, title: title || undefined, description, bonusPoints: bonus, adminNote: note || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Có lỗi xảy ra", "error");
      return;
    }
    toast(action === "approve" ? `Đã duyệt, cộng ${task.bonusPoints} điểm cho Sale` : "Đã cập nhật", "success");
    router.refresh();
  }

  const open = task.status === "REQUESTED" || task.status === "SUBMITTED" || task.status === "ASSIGNED";

  return (
    <article className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 sm:p-5">
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <span className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
          {task.place.avatar && <Image src={task.place.avatar} alt="" fill sizes="40px" className="object-cover" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-slate-800">{task.place.name}</p>
          <p className="text-xs text-slate-400">{task.place.salePoints} điểm hiện tại</p>
        </div>
        <span className={`text-xs font-bold rounded-full px-3 py-1 ${TASK_STATUS_TONE[task.status]}`}>{TASK_STATUS_LABEL[task.status]}</span>
      </div>

      {task.saleNote && (
        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2 mb-3">
          <span className="font-semibold text-slate-500">{task.status === "REQUESTED" ? "Sale nhắn: " : "Sale báo: "}</span>
          {task.saleNote}
        </p>
      )}

      {open && (
        <div className="space-y-2.5">
          {task.status === "REQUESTED" ? (
            <>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên nhiệm vụ (vd: Đăng 3 video giới thiệu homestay)" className={INPUT} maxLength={120} />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Mô tả cách làm, tiêu chí hoàn thành" className={INPUT} />
            </>
          ) : (
            <p className="text-sm text-slate-700">
              <span className="font-bold">{task.title}</span>
              {task.description && <span className="text-slate-500"> — {task.description}</span>}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {task.status === "REQUESTED" && (
              <>
                <label className="text-xs text-slate-500 flex items-center gap-1.5">
                  Điểm thưởng
                  <input type="number" min={0} max={100} value={bonus} onChange={(e) => setBonus(Number(e.target.value))} className="w-20 border border-slate-200 rounded-lg px-2 py-1.5 text-sm" />
                </label>
                <button type="button" disabled={busy} onClick={() => act("assign")} className={`${BTN} bg-brand-blue text-white hover:brightness-95`}>
                  Giao nhiệm vụ
                </button>
              </>
            )}
            {task.status === "SUBMITTED" && (
              <>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú cho Sale (không bắt buộc)" className={`${INPUT} sm:max-w-xs`} />
                <button type="button" disabled={busy} onClick={() => act("approve")} className={`${BTN} bg-brand-green text-white hover:brightness-95`}>
                  ✓ Duyệt (+{task.bonusPoints} điểm)
                </button>
                <button type="button" disabled={busy} onClick={() => act("return")} className={`${BTN} border border-slate-300 text-slate-600 hover:bg-slate-50`}>
                  Làm lại
                </button>
              </>
            )}
            <button type="button" disabled={busy} onClick={() => act("reject")} className={`${BTN} border border-brand-red/40 text-brand-red hover:bg-brand-redBg`}>
              Từ chối
            </button>
          </div>
        </div>
      )}

      {!open && (
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-700">{task.title ?? "(không tên)"}</span>
          {task.status === "DONE" && ` · +${task.bonusPoints} điểm`}
          {task.adminNote && ` · Ghi chú: ${task.adminNote}`}
        </p>
      )}
    </article>
  );
}
