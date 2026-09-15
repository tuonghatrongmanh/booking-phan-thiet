import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isForumSlug, slugToEnum, FORUM_CATEGORIES, POST_TYPES, type PostTypeKey } from "@/lib/forum";
import { getTopHashtags, getTopMembers, getFeaturedPlaces, getRecentActivity, getForumStats } from "@/lib/forum-data";
import Header from "@/components/home/Header";
import ForumPostForm from "@/components/forum/ForumPostForm";
import ForumFeed from "@/components/forum/ForumFeed";
import ForumLeftSidebar from "@/components/forum/ForumLeftSidebar";
import ForumRightSidebar from "@/components/forum/ForumRightSidebar";
import ForumFilterTabs from "@/components/forum/ForumFilterTabs";

export const dynamic = "force-dynamic";

export default async function ForumCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ type?: string; sort?: string; tag?: string; q?: string }>;
}) {
  const { category: slug } = await params;
  const { type, sort = "newest", tag, q } = await searchParams;
  if (!isForumSlug(slug)) notFound();

  const info = FORUM_CATEGORIES[slug];
  const category = slugToEnum(slug);

  const isTypeFilter = !!type && type in POST_TYPES;
  const orderBy = sort === "top" ? ({ reactions: { _count: "desc" } } as const) : ({ createdAt: "desc" } as const);

  // Can biet actor truoc de loc dung reactions cua chinh nguoi nay trong cau query posts
  // (hien "da tha cam xuc gi" dung tu dau, khong doan mo o feed) - nen phai await auth()
  // truoc, khong the gom chung vao Promise.all voi query posts nhu cu.
  const session = await auth();
  const sessionUser = session?.user as { id?: string; type?: string } | undefined;
  const loggedIn = !!sessionUser?.type;
  const isAdmin = sessionUser?.type === "admin";
  const currentUserId = sessionUser?.type === "user" ? sessionUser.id : undefined;

  const [posts, hashtags, members, featuredPlaces, activity, stats] = await Promise.all([
    prisma.forumPost.findMany({
      where: {
        category,
        ...(isTypeFilter ? { postType: type as PostTypeKey } : {}),
        ...(tag ? { hashtags: { some: { hashtag: { tag } } } } : {}),
        ...(q ? { OR: [{ title: { contains: q } }, { content: { contains: q } }] } : {}),
      },
      orderBy,
      take: 30,
      include: {
        authorUser: { select: { id: true, name: true, avatar: true } },
        authorAdmin: { select: { id: true, name: true } },
        media: true,
        hashtags: { include: { hashtag: { select: { tag: true } } } },
        reactions: { where: { userId: currentUserId ?? "" }, select: { type: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    }),
    getTopHashtags(),
    getTopMembers(),
    getFeaturedPlaces(),
    getRecentActivity(),
    getForumStats(),
  ]);

  const currentUser = isAdmin
    ? await prisma.admin.findUnique({ where: { id: sessionUser!.id! }, select: { name: true } }).then((a) => (a ? { name: a.name, avatar: null as string | null } : null))
    : currentUserId
      ? await prisma.user.findUnique({ where: { id: currentUserId }, select: { name: true, avatar: true } })
      : null;

  const serializedPosts = posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <section className="container-custom py-5">
        <div className="grid lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px] gap-5 items-start">
          <ForumLeftSidebar
            categorySlug={slug}
            activeType={type}
            sort={sort}
            hashtags={hashtags}
            members={members}
          />

          <div className="xl:col-span-2 grid xl:grid-cols-[1fr_300px] gap-5 items-start">
            <div>
              <div id="composer" className="scroll-mt-24 mb-4">
                {loggedIn ? (
                  <ForumPostForm categorySlug={slug} currentUser={currentUser} />
                ) : (
                  <a
                    href={`/dang-nhap?callbackUrl=/${slug}`}
                    className="block w-full bg-white rounded-2xl shadow-card px-5 py-4 text-center text-sm font-semibold text-brand-blue hover:bg-sky-50 transition"
                  >
                    Đăng nhập để đăng bài trong cộng đồng {info.label}
                  </a>
                )}
              </div>

              <ForumFilterTabs categorySlug={slug} activeType={type} sort={sort} tag={tag} />

              <ForumFeed
                initialPosts={serializedPosts}
                categorySlug={slug}
                currentUserId={currentUserId}
                currentActorId={sessionUser?.id}
                isAdmin={isAdmin}
              />
            </div>

            <ForumRightSidebar places={featuredPlaces} activity={activity} stats={stats} />
          </div>
        </div>
      </section>
    </div>
  );
}
