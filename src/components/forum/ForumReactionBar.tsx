"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { REACTION_ICONS } from "@/lib/forum";
import { getSocket } from "@/lib/socket-client";
import { useForumRoom } from "@/lib/use-forum-room";
import { forumPostRoom } from "@/lib/socket-rooms";
import ShareButton from "./ShareButton";

const REACTION_TYPES = Object.keys(REACTION_ICONS);
const DEFAULT_TYPE = "LIKE";
const ACTION_BTN_CLASS =
  "flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 rounded-lg py-2 hover:bg-slate-50 transition";

// Thanh cam xuc kieu Facebook: 1 nut "Thich" chinh (bam = tha nhanh LIKE, hover/bam giu
// hien bang chon 6 loai cam xuc), cong voi nut Binh luan + Chia se. Dung chung cho ca
// feed card lan modal/trang chi tiet bai viet.
export default function ForumReactionBar({
  postId,
  total,
  myReaction,
  loggedIn,
  commentCount,
  onCommentClick,
  sharePath,
}: {
  postId: string;
  total: number;
  myReaction: string | null;
  loggedIn: boolean;
  commentCount?: number;
  onCommentClick?: () => void;
  sharePath?: string;
}) {
  const router = useRouter();
  const [active, setActive] = useState(myReaction);
  const [count, setCount] = useState(total);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useForumRoom(forumPostRoom(postId));

  useEffect(() => {
    const socket = getSocket();
    function onReactionUpdate(data: { postId: string; total: number }) {
      if (data.postId === postId) setCount(data.total);
    }
    socket.on("reaction:update", onReactionUpdate);
    return () => {
      socket.off("reaction:update", onReactionUpdate);
    };
  }, [postId]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  async function sendReaction(type: string) {
    if (!loggedIn) {
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (busy) return;
    setBusy(true);
    setPickerOpen(false);

    const wasSameActive = active === type;
    setActive(wasSameActive ? null : type);
    setCount((c) => (wasSameActive ? c - 1 : active ? c : c + 1));

    const res = await fetch(`/api/forum/posts/${postId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    setBusy(false);

    if (res.ok) {
      const data = await res.json();
      setActive(data.active);
      router.refresh();
    }
  }

  function openPicker() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setPickerOpen(true);
  }
  function scheduleClosePicker() {
    closeTimer.current = setTimeout(() => setPickerOpen(false), 300);
  }

  const activeInfo = active ? REACTION_ICONS[active] : null;

  return (
    <div className="pointer-events-auto">
      {count > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1 pb-1.5">
          <span className="flex items-center gap-1">
            <i className="fa-solid fa-heart text-brand-red" aria-hidden="true" /> {count}
          </span>
          {typeof commentCount === "number" && commentCount > 0 && <span>{commentCount} bình luận</span>}
        </div>
      )}

      <div className="flex items-center gap-1 border-t border-slate-100 pt-1">
        <div className="relative flex-1" onMouseEnter={openPicker} onMouseLeave={scheduleClosePicker}>
          {pickerOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full left-0 mb-1 flex items-center gap-1 bg-white rounded-full shadow-xl px-2 py-1.5 border border-slate-100 z-20 animate-fade-up"
            >
              {REACTION_TYPES.map((type) => {
                const r = REACTION_ICONS[type];
                return (
                  <button
                    key={type}
                    type="button"
                    title={r.label}
                    onClick={(e) => {
                      e.stopPropagation();
                      sendReaction(type);
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-lg hover:scale-125 hover:-translate-y-1 transition-transform"
                  >
                    <i className={r.icon} style={{ color: r.color }} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sendReaction(active ?? DEFAULT_TYPE);
            }}
            className={ACTION_BTN_CLASS}
            style={activeInfo ? { color: activeInfo.color } : undefined}
          >
            <i className={activeInfo ? activeInfo.icon : "fa-solid fa-thumbs-up"} aria-hidden="true" />
            {activeInfo ? activeInfo.label : "Thích"}
          </button>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // Neu khong duoc truyen san hanh vi rieng (vd mo modal tu feed card) thi
            // mac dinh cuon toi khung binh luan ngay tren cung trang (modal/trang chi tiet).
            if (onCommentClick) onCommentClick();
            else document.getElementById("forum-comments")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className={ACTION_BTN_CLASS}
        >
          <i className="fa-solid fa-comment" aria-hidden="true" />
          Bình luận
        </button>

        {sharePath && <ShareButton path={sharePath} className={ACTION_BTN_CLASS} />}
      </div>
    </div>
  );
}
