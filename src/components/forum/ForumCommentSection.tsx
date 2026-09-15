"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSocket } from "@/lib/socket-client";
import { useForumRoom } from "@/lib/use-forum-room";
import { forumPostRoom } from "@/lib/socket-rooms";
import TimeAgo from "./TimeAgo";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatar: string };
};

export default function ForumCommentSection({
  postId,
  initialComments,
  loggedIn,
}: {
  postId: string;
  initialComments: Comment[];
  loggedIn: boolean;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useForumRoom(forumPostRoom(postId));

  useEffect(() => {
    const socket = getSocket();
    function onNewComment(comment: Comment) {
      setComments((c) => (c.some((existing) => existing.id === comment.id) ? c : [...c, comment]));
    }
    socket.on("comment:new", onNewComment);
    return () => {
      socket.off("comment:new", onNewComment);
    };
  }, [postId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!loggedIn) {
      router.push(`/dang-nhap?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    if (!content.trim()) return;

    setSaving(true);
    setError(null);

    const res = await fetch(`/api/forum/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra");
      return;
    }

    const newComment = await res.json();
    // Su kien realtime "comment:new" cua chinh binh luan nay co the da den truoc khi
    // fetch() o day tra ve xong (WebSocket push thuong nhanh hon tron ven 1 vong HTTP
    // response) - phai kiem tra trung id truoc khi them, khong la se hien 2 binh luan
    // giong het nhau (day chinh la nguyen nhan loi "trung key" nguoi dung gap phai).
    setComments((c) => (c.some((existing) => existing.id === newComment.id) ? c : [...c, newComment]));
    setContent("");
  }

  return (
    <div id="forum-comments" className="space-y-4 scroll-mt-24">
      <h3 className="font-display font-bold text-slate-800">Bình luận ({comments.length})</h3>

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2.5">
            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-brand-sky">
              <Image src={c.author.avatar} alt={c.author.name} fill className="object-cover" />
            </div>
            <div className="bg-slate-50 rounded-2xl px-4 py-2.5 flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800">{c.author.name}</p>
              <p className="text-sm text-slate-600 break-words">{c.content}</p>
              <TimeAgo date={c.createdAt} className="text-[11px] text-slate-400 mt-1 block" />
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-slate-400">Chưa có bình luận nào.</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={loggedIn ? "Viết bình luận..." : "Đăng nhập để bình luận"}
          className="flex-1 border border-slate-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-10 h-10 rounded-full bg-brand-blue hover:brightness-95 transition flex items-center justify-center text-white shrink-0 disabled:opacity-60"
          aria-label="Gửi bình luận"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7z" />
          </svg>
        </button>
      </form>
      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}
    </div>
  );
}
