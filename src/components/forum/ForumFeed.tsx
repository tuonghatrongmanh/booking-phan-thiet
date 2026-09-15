"use client";

import { useEffect, useRef, useState } from "react";
import ForumPostCard from "./ForumPostCard";
import { getSocket } from "@/lib/socket-client";
import { useForumRoom } from "@/lib/use-forum-room";
import { forumCategoryRoom } from "@/lib/socket-rooms";

type Post = Parameters<typeof ForumPostCard>[0]["post"];
type StatsPayload = { postId: string; commentsCount?: number; reactionsCount?: number };

// Realtime that qua Socket.io: server phat "post:new"/"post:stats" ngay khi co ai
// dang bai/binh luan/tha cam xuc trong danh muc nay - khong con phai poll dinh ky.
// Khong tu dong chen bai moi vao giua luc nguoi dung dang doc - hien nut de ho chu dong bam,
// giong hanh vi cu.
export default function ForumFeed({
  initialPosts,
  categorySlug,
  currentUserId,
  currentActorId,
  isAdmin,
}: {
  initialPosts: Post[];
  categorySlug: string;
  currentUserId?: string;
  currentActorId?: string;
  isAdmin?: boolean;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [newCount, setNewCount] = useState(0);
  const latestRef = useRef(initialPosts[0]?.createdAt ?? null);
  const pendingRef = useRef<Post[]>([]);
  const postsRef = useRef(initialPosts);
  postsRef.current = posts;

  useForumRoom(forumCategoryRoom(categorySlug));

  useEffect(() => {
    const socket = getSocket();

    function onNewPost(post: Post) {
      // Phong ngua trung lap (vd 2 ket noi socket chong nhau do hot-reload luc dev,
      // hoac su kien den 2 lan) - khong them neu id da co san trong feed hoac hang cho.
      if (postsRef.current.some((p) => p.id === post.id) || pendingRef.current.some((p) => p.id === post.id)) {
        return;
      }

      // Bai viet cua chinh minh vua dang -> hien ngay lap tuc, khong bat cho ho bam nut
      // "bai viet moi" (banner do chi hop ly cho bai cua NGUOI KHAC).
      const isOwnPost = !!currentActorId && (post.authorUser?.id === currentActorId || post.authorAdmin?.id === currentActorId);
      if (isOwnPost) {
        setPosts((prev) => [post, ...prev]);
        latestRef.current = post.createdAt;
        return;
      }

      pendingRef.current = [post, ...pendingRef.current];
      setNewCount(pendingRef.current.length);
    }

    function onStats(data: StatsPayload) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === data.postId
            ? {
                ...p,
                _count: {
                  comments: data.commentsCount ?? p._count.comments,
                  reactions: data.reactionsCount ?? p._count.reactions,
                },
              }
            : p
        )
      );
    }

    // Ket noi lai sau khi mat mang tam thoi -> hoi bu lai phan co the da bi lo (1 request duy nhat,
    // khong phai poll lien tuc) de dam bao khong mat bai viet khi wifi/4G chap chon.
    let hasConnectedBefore = false;
    async function reconcile() {
      if (!latestRef.current) return;
      try {
        const res = await fetch(
          `/api/forum/posts?category=${categorySlug}&since=${encodeURIComponent(latestRef.current)}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const fresh: Post[] = await res.json();
        const existingIds = new Set([...postsRef.current.map((p) => p.id), ...pendingRef.current.map((p) => p.id)]);
        const merged = [...fresh.filter((p) => !existingIds.has(p.id)), ...pendingRef.current];
        if (merged.length > 0) {
          pendingRef.current = merged;
          setNewCount(merged.length);
        }
      } catch {
        // bo qua loi mang tam thoi
      }
    }
    function onConnect() {
      if (hasConnectedBefore) reconcile();
      hasConnectedBefore = true;
    }

    socket.on("post:new", onNewPost);
    socket.on("post:stats", onStats);
    socket.on("connect", onConnect);

    return () => {
      socket.off("post:new", onNewPost);
      socket.off("post:stats", onStats);
      socket.off("connect", onConnect);
    };
  }, [categorySlug]);

  function showNewPosts() {
    // Chup snapshot truoc khi xoa ref: setPosts(updater) khong doc pendingRef.current
    // ngay lap tuc ma doi den luc React thuc su goi updater (sau khi ham nay return),
    // luc do neu da xoa ref thi updater se doc phai mang rong.
    const revealed = pendingRef.current;
    pendingRef.current = [];
    setPosts((prev) => [...revealed, ...prev]);
    latestRef.current = revealed[0]?.createdAt ?? latestRef.current;
    setNewCount(0);
  }

  return (
    <div className="space-y-4">
      {newCount > 0 && (
        <button
          type="button"
          onClick={showNewPosts}
          className="w-full bg-brand-blue text-white text-sm font-bold rounded-xl py-2.5 hover:brightness-95 transition animate-fade-up"
        >
          <i className="fa-solid fa-arrow-up" aria-hidden="true" /> {newCount} bài viết mới — bấm để xem
        </button>
      )}

      {posts.length === 0 && (
        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-400">
          Chưa có bài đăng nào trong mục này. Hãy là người đầu tiên chia sẻ!
        </div>
      )}

      {posts.map((post) => (
        <ForumPostCard
          key={post.id}
          post={post}
          categorySlug={categorySlug}
          currentUserId={currentUserId}
          currentActorId={currentActorId}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  );
}
