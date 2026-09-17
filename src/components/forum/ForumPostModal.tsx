"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { POST_TYPES, type PostTypeKey } from "@/lib/forum";
import ForumReactionBar from "./ForumReactionBar";
import ForumCommentSection from "./ForumCommentSection";
import TimeAgo from "./TimeAgo";

type MediaItem = { id: string; url: string; type: string };
type FullPost = {
  id: string;
  title: string;
  content: string;
  postType: string;
  locationTag: string | null;
  createdAt: string;
  views: number;
  authorUser: { id: string; name: string; avatar: string } | null;
  authorAdmin: { id: string; name: string } | null;
  media: MediaItem[];
  hashtags: { hashtag: { tag: string } }[];
  comments: { id: string; content: string; createdAt: string; author: { id: string; name: string; avatar: string } }[];
  reactions: { type: string; userId: string }[];
};

// Popup xem chi tiet bai viet (anh + noi dung + cam xuc + binh luan realtime) thay vi
// chuyen trang - dung khi bam vao 1 the bai trong feed. Trang /category/postId van giu
// nguyen (link chia se, SEO, mo truc tiep), modal nay chi la duong tat nhanh hon tu feed.
export default function ForumPostModal({
  postId,
  categorySlug,
  currentUserId,
  currentActorId,
  loggedIn,
  onClose,
}: {
  postId: string;
  categorySlug: string;
  currentUserId?: string;
  currentActorId?: string;
  loggedIn: boolean;
  onClose: () => void;
}) {
  const [post, setPost] = useState<FullPost | null>(null);
  const [error, setError] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/forum/posts/${postId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const myReaction = post && currentUserId ? (post.reactions.find((r) => r.userId === currentUserId)?.type ?? null) : null;
  const authorName = post ? (post.authorUser?.name ?? post.authorAdmin?.name ?? "Ẩn danh") : "";
  const isOwnPost =
    !!post && !!currentActorId && (post.authorUser?.id === currentActorId || post.authorAdmin?.id === currentActorId);
  const authorAvatar = post?.authorUser?.avatar ?? (post?.authorAdmin ? "/images/admin.png" : "/images/avatar-world.png");
  const typeInfo = post ? (POST_TYPES[post.postType as PostTypeKey] ?? POST_TYPES.POST) : null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-center relative px-4 py-3 border-b border-slate-200 shrink-0">
          <h2 className="font-display font-bold text-lg text-slate-800">Bài viết</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {!post && !error && <div className="p-10 text-center text-slate-400">Đang tải...</div>}
        {error && <div className="p-10 text-center text-brand-red">Không tải được bài viết.</div>}

        {post && (
          <div className="overflow-y-auto">
            <div className="px-4 pt-3">
              <div className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-brand-sky">
                  <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    {authorName}
                    {isOwnPost && <span className="text-slate-400 font-normal">(bạn)</span>}
                    {post.authorAdmin && (
                      <span className="text-[10px] font-bold text-white bg-brand-blue px-1.5 py-0.5 rounded-full">Admin</span>
                    )}
                  </p>
                  <TimeAgo date={post.createdAt} className="text-xs text-slate-400" />
                </div>
                {typeInfo && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-brand-blue bg-brand-sky px-2.5 py-1 rounded-full shrink-0">
                    <i className={typeInfo.icon} aria-hidden="true" /> {typeInfo.label}
                  </span>
                )}
              </div>

              <p className="font-display font-bold text-slate-800 mt-3">{post.title}</p>
              <p className="text-[15px] text-slate-600 whitespace-pre-line mt-1">{post.content}</p>
              {post.locationTag && (
                <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                  <i className="fa-solid fa-location-dot" aria-hidden="true" /> {post.locationTag}
                </p>
              )}
            </div>

            {post.media.length > 0 && (
              <div className="relative mt-3 bg-slate-900">
                <div className="relative aspect-video">
                  {post.media[activeImg].type === "VIDEO" ? (
                    <video src={post.media[activeImg].url} controls className="w-full h-full object-contain" />
                  ) : (
                    <Image src={post.media[activeImg].url} alt="" fill className="object-contain" />
                  )}
                </div>
                {post.media.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveImg((i) => (i - 1 + post.media.length) % post.media.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
                      aria-label="Ảnh trước"
                    >
                      <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveImg((i) => (i + 1) % post.media.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition"
                      aria-label="Ảnh sau"
                    >
                      <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                      {post.media.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImg(i)}
                          className={`w-1.5 h-1.5 rounded-full transition ${i === activeImg ? "bg-white" : "bg-white/40"}`}
                          aria-label={`Ảnh ${i + 1}`}
                        />
                      ))}
                    </div>
                    <span className="absolute top-2 right-2 text-xs font-semibold text-white bg-black/50 px-2 py-0.5 rounded-full">
                      {activeImg + 1}/{post.media.length}
                    </span>
                  </>
                )}
              </div>
            )}

            {post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 mt-3">
                {post.hashtags.map((h) => (
                  <span key={h.hashtag.tag} className="text-xs font-semibold text-brand-blue bg-brand-sky px-2 py-0.5 rounded-full">
                    #{h.hashtag.tag}
                  </span>
                ))}
              </div>
            )}

            <div className="px-4 mt-3">
              <ForumReactionBar
                postId={post.id}
                total={post.reactions.length}
                myReaction={myReaction}
                loggedIn={loggedIn}
                commentCount={post.comments.length}
                sharePath={`/${categorySlug}/${post.id}`}
              />
            </div>

            <div className="px-4 py-4 border-t border-slate-100 mt-2">
              <ForumCommentSection postId={post.id} initialComments={post.comments} loggedIn={loggedIn} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
