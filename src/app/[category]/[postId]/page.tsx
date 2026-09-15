import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import TranslatedField from "@/components/i18n/TranslatedField";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isForumSlug, FORUM_CATEGORIES, POST_TYPES, type PostTypeKey } from "@/lib/forum";
import Header from "@/components/home/Header";
import ScrollTopButton from "@/components/home/ScrollTopButton";
import ForumReactionBar from "@/components/forum/ForumReactionBar";
import ForumCommentSection from "@/components/forum/ForumCommentSection";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default async function ForumPostPage({
  params,
}: {
  params: Promise<{ category: string; postId: string }>;
}) {
  const { category: slug, postId } = await params;
  if (!isForumSlug(slug)) notFound();
  const info = FORUM_CATEGORIES[slug];

  const [session, post] = await Promise.all([
    auth(),
    prisma.forumPost.findUnique({
      where: { id: postId },
      include: {
        authorUser: { select: { id: true, name: true, avatar: true } },
        authorAdmin: { select: { id: true, name: true } },
        media: true,
        hashtags: { include: { hashtag: { select: { tag: true } } } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { id: true, name: true, avatar: true } } },
        },
        reactions: { select: { type: true, userId: true } },
      },
    }),
  ]);

  if (!post || post.category !== info.enum) notFound();

  prisma.forumPost.update({ where: { id: postId }, data: { views: { increment: 1 } } }).catch(() => {});

  const sessionUser = session?.user as { id?: string; type?: string } | undefined;
  const loggedIn = sessionUser?.type === "user";
  const myReaction = loggedIn ? post.reactions.find((r) => r.userId === sessionUser!.id)?.type ?? null : null;

  const authorName = post.authorUser?.name ?? post.authorAdmin?.name ?? "Ẩn danh";
  const authorAvatar = post.authorUser?.avatar ?? (post.authorAdmin ? "/images/admin.png" : "/images/avatar-world.png");
  const isAdminPost = !!post.authorAdmin;
  const isOwnPost = !!sessionUser?.id && (post.authorUser?.id === sessionUser.id || post.authorAdmin?.id === sessionUser.id);
  const typeInfo = POST_TYPES[post.postType as PostTypeKey] ?? POST_TYPES.POST;

  return (
    <>
      <Header />

      <section className="bg-navbar-gradient py-8">
        <div className="container-custom">
          <Link href={`/${slug}`} className="inline-flex items-center gap-1.5 text-white/85 hover:text-white text-sm font-bold mb-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M11 19l-7-7 7-7M4 12h16" />
            </svg>
            Cộng đồng {info.label}
          </Link>
        </div>
      </section>

      <section className="container-custom py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-brand-sky">
                <Image src={authorAvatar} alt={authorName} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 truncate">
                  {authorName}
                  {isOwnPost && <span className="text-slate-400 font-normal">(bạn)</span>}
                  {isAdminPost && (
                    <span className="text-[10px] font-bold text-white bg-brand-blue px-1.5 py-0.5 rounded-full shrink-0">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(post.createdAt)} · {post.views.toLocaleString("vi-VN")} lượt xem
                  {post.locationTag && (
                    <>
                      {" "}
                      · <i className="fa-solid fa-location-dot" aria-hidden="true" /> {post.locationTag}
                    </>
                  )}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-brand-blue bg-brand-sky px-2.5 py-1 rounded-full shrink-0">
              <i className={typeInfo.icon} aria-hidden="true" /> {typeInfo.label}
            </span>
          </div>

          <TranslatedField as="h1" model="ForumPost" recordId={post.id} field="title" className="font-display font-bold text-xl text-slate-800 mb-2">
            {post.title}
          </TranslatedField>
          <TranslatedField as="p" model="ForumPost" recordId={post.id} field="content" className="text-[15px] text-slate-600 whitespace-pre-line mb-4">
            {post.content}
          </TranslatedField>

          {post.media.length > 0 && (
            <div className={`grid gap-2 mb-3 ${post.media.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
              {post.media.map((m) => (
                <div key={m.id} className="relative aspect-video rounded-xl overflow-hidden bg-slate-900">
                  {m.type === "VIDEO" ? (
                    <video src={m.url} controls className="w-full h-full object-cover" />
                  ) : (
                    <Image src={m.url} alt="" fill className="object-cover" />
                  )}
                </div>
              ))}
            </div>
          )}

          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.hashtags.map((h) => (
                <span key={h.hashtag.tag} className="text-xs font-semibold text-brand-blue bg-brand-sky px-2 py-0.5 rounded-full">
                  #{h.hashtag.tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 mb-5">
            <ForumReactionBar
              postId={post.id}
              total={post.reactions.length}
              myReaction={myReaction}
              loggedIn={loggedIn}
              commentCount={post.comments.length}
              sharePath={`/${slug}/${post.id}`}
            />
          </div>

          <ForumCommentSection
            postId={post.id}
            initialComments={post.comments.map((c) => ({
              id: c.id,
              content: c.content,
              createdAt: c.createdAt.toISOString(),
              author: c.author,
            }))}
            loggedIn={loggedIn}
          />
        </div>
      </section>

      <ScrollTopButton />
    </>
  );
}
