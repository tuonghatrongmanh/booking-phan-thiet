"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDialog } from "@/components/ui/DialogProvider";
import { TASK_STATUS_LABEL, TASK_STATUS_TONE, type SaleTaskStatus } from "@/lib/sale-tasks";

export type MyTask = {
  id: string;
  status: SaleTaskStatus;
  title: string | null;
  description: string | null;
  bonusPoints: number;
  saleNote: string | null;
  adminNote: string | null;
};

function TaskItem({ task }: { task: MyTask }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const res = await fetch(`/api/sale-profile/me/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Không gửi được", "error");
      return;
    }
    toast("Đã báo hoàn thành, chờ admin duyệt", "success");
    router.refresh();
  }

  return (
    <li className="border border-slate-100 rounded-xl p-3.5">
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="font-semibold text-slate-800 text-[15px]">{task.title ?? "Yêu cầu nhiệm vụ của bạn"}</p>
        <span className={`shrink-0 text-[11px] font-bold rounded-full px-2.5 py-1 ${TASK_STATUS_TONE[task.status]}`}>{TASK_STATUS_LABEL[task.status]}</span>
      </div>
      {task.description && <p className="text-sm text-slate-500 whitespace-pre-line">{task.description}</p>}
      {task.bonusPoints > 0 && task.status !== "REQUESTED" && <p className="text-xs font-bold text-brand-blue mt-1">Thưởng +{task.bonusPoints} điểm khi hoàn thành</p>}
      {task.adminNote && <p className="text-xs text-slate-500 mt-1">Admin: {task.adminNote}</p>}
      {task.status === "ASSIGNED" && (
        <div className="mt-2.5 space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Bạn đã làm gì? (dán link bài đăng, kết quả...)"
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <button type="button" disabled={busy || note.trim().length < 3} onClick={submit} className="text-sm font-bold text-white bg-brand-blue rounded-lg px-4 py-2 disabled:opacity-50 hover:brightness-95">
            {busy ? "Đang gửi..." : "Báo đã hoàn thành"}
          </button>
        </div>
      )}
    </li>
  );
}

// Sale xin admin giao nhiệm vụ để tăng điểm xếp hạng, xem việc được giao và báo hoàn thành
export default function SaleTasksCard({ tasks }: { tasks: MyTask[] }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const hasOpenRequest = tasks.some((t) => t.status === "REQUESTED");

  async function request() {
    setBusy(true);
    const res = await fetch("/api/sale-profile/me/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      toast(typeof data.error === "string" ? data.error : "Không gửi được yêu cầu", "error");
      return;
    }
    setMessage("");
    toast("Đã gửi yêu cầu, admin sẽ giao nhiệm vụ cho bạn", "success");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-bullseye text-brand-blue" aria-hidden="true" /> Nhiệm vụ tăng điểm xếp hạng
      </p>
      <p className="text-xs text-slate-400 mb-4">Muốn lên hạng nhanh hơn? Xin admin giao nhiệm vụ. Hoàn thành và được duyệt sẽ cộng điểm thưởng vào xếp hạng của bạn.</p>

      <div className="space-y-2 mb-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          maxLength={500}
          disabled={hasOpenRequest}
          placeholder={hasOpenRequest ? "Bạn đang có một yêu cầu chờ admin giao việc" : "Lời nhắn cho admin (không bắt buộc): bạn mạnh mảng nào, muốn làm gì..."}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:bg-slate-50"
        />
        <button type="button" disabled={busy || hasOpenRequest} onClick={request} className="text-sm font-bold text-white bg-brand-blue rounded-lg px-4 py-2 disabled:opacity-50 hover:brightness-95">
          {busy ? "Đang gửi..." : "Xin nhiệm vụ mới"}
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-slate-400">Chưa có nhiệm vụ nào.</p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((t) => (
            <TaskItem key={t.id + t.status} task={t} />
          ))}
        </ul>
      )}
    </div>
  );
}
