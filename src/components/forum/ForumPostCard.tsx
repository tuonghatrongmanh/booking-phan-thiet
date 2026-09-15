"use client";

import { useState } from "react";
import TranslatedField from "@/components/i18n/TranslatedField";
import Image from "next/image";
import { POST_TYPES, type PostTypeKey } from "@/lib/forum";
import TimeAgo from "./TimeAgo";
import ForumPostMenu from "./ForumPostMenu";
import ForumReactionBar from "./ForumReactionBar";
import ForumPostModal from "./ForumPostModal";

type Post = {
  id: string;
  title: string;
  content: string;
  postType: string;
  locationTag: string | null;
  createdAt: string;
  views: number;
  authorUser: { id: string; name: string; avatar: string } | null;
  authorAdmin: { id: string; name: string } | null;
  media: { id: string; url: string; type: string }[];
  hashtags: { hashtag: { tag: string } }[];
  reactions: { type: string }[];
  _count: { comments: number; reactions: number };
};

const MAX_VISIBLE_MEDIA = 3;

export default function ForumPostCard({
  post,
  categorySlug,
  currentUserId,
  currentActorId,
  isAdmin,
}: {
  post: Post;
  categorySlug: string;
  currentUserId?: string;
  currentActorId?: string;
  isAdmin?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  const authorName = post.authorUser?.name ?? post.authorAdmin?.name ?? "Ẩn danh";
  const authorAvatar = post.authorUser?.avatar ?? (post.authorAdmin ? "/images/admin.png" : "/images/avatar-world.png");
  const isAdminPost = !!post.authorAdmin;
  const isOwnPost = !!currentActorId && (post.authorUser?.id === currentActorId || post.authorAdmin?.id === currentActorId);
  const typeInfo = POST_TYPES[post.postType as PostTypeKey] ?? POST_TYPES.POST;
  const visibleMedia = post.media.slice(0, MAX_VISIBLE_MEDIA);
  const extraCount = post.media.length - visibleMedia.length;
  const detailPath = `/${categorySlug}/${post.id}`;
  const canManage = !!isAdmin || (!!currentUserId && post.authorUser?.id === currentUserId);
  const loggedIn = !!currentUserId;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setModalOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setModalOpen(true);
        }}
        className="relative bg-white rounded-2xl shadow-card p-5 hover-lift animate-fade-up cursor-pointer text-left"
      >
        <div className="pointer-events-none">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 bg-brand-sky">
                <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 truncate">
                  {authorName}
                  {isOwnPost && <span className="text-slate-400 font-normal shrink-0">(bạn)</span>}
                  {isAdminPost && (
                    <span className="text-[10px] font-bold text-white bg-brand-blue px-1.5 py-0.5 rounded-full shrink-0">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  <TimeAgo date={post.createdAt} />
                  {post.locationTag && (
                    <>
                      {" "}
                      · <i className="fa-solid fa-location-dot" aria-hidden="true" /> {post.locationTag}
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-brand-blue bg-brand-sky px-2.5 py-1 rounded-full">
                <i className={typeInfo.icon} aria-hidden="true" /> {typeInfo.label}
              </span>
              {canManage && <ForumPostMenu postId={post.id} />}
            </div>
          </div>

          <TranslatedField as="p" model="ForumPost" recordId={post.id} field="title" className="font-display font-bold text-slate-800 mb-1.5">
            {post.title}
          </TranslatedField>
          <TranslatedField as="p" model="ForumPost" recordId={post.id} field="content" className="text-sm text-slate-500 line-clamp-3 mb-3">
            {post.content}
          </TranslatedField>

          {visibleMedia.length > 0 && (
            <div className={`grid gap-2 mb-3 ${visibleMedia.length === 1 ? "grid-cols-1" : "grid-cols-3"}`}>
              {visibleMedia.map((m, i) => (
                <div key={m.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-900">
                  {m.type === "VIDEO" ? (
                    <video src={m.url} className="w-full h-full object-cover" muted />
                  ) : (
                    <Image src={m.url} alt="" fill className="object-cover" />
                  )}
                  {i === visibleMedia.length - 1 && extraCount > 0 && (
                    <div className="absolute inset-0 bg-black/55 flex items-center justify-center text-white font-bold text-lg">
                      +{extraCount}
                    </div>
                  )}
                  {m.type === "VIDEO" && extraCount === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-2xl">
                      <i className="fa-solid fa-circle-play" aria-hidden="true" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {post.hashtags.map((h) => (
                <span key={h.hashtag.tag} className="text-xs font-semibold text-brand-blue bg-brand-sky px-2 py-0.5 rounded-full">
                  #{h.hashtag.tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-right text-xs text-slate-400 mb-1">{post.views.toLocaleString("vi-VN")} lượt xem</p>
        </div>

        <ForumReactionBar
          postId={post.id}
          total={post._count.reactions}
          myReaction={post.reactions[0]?.type ?? null}
          loggedIn={loggedIn}
          commentCount={post._count.comments}
          onCommentClick={() => setModalOpen(true)}
          sharePath={detailPath}
        />
      </div>

      {modalOpen && (
        <ForumPostModal
          postId={post.id}
          categorySlug={categorySlug}
          currentUserId={currentUserId}
          currentActorId={currentActorId}
          loggedIn={loggedIn}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
