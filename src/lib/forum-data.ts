import { prisma } from "@/lib/prisma";
import { enumToSlug } from "@/lib/forum";

export async function getTopHashtags() {
  const [pinned, rest] = await Promise.all([
    prisma.hashtag.findMany({ where: { pinnedRank: { not: null } }, orderBy: { pinnedRank: "asc" } }),
    prisma.hashtag.findMany({ where: { pinnedRank: null }, orderBy: { count: "desc" }, take: 10 }),
  ]);
  return [...pinned, ...rest].slice(0, 10);
}

export async function getTopMembers() {
  const [pinned, rest] = await Promise.all([
    prisma.user.findMany({
      where: { rankOverride: { not: null } },
      orderBy: { rankOverride: "asc" },
      select: { id: true, name: true, avatar: true, points: true },
    }),
    prisma.user.findMany({
      where: { rankOverride: null },
      orderBy: { points: "desc" },
      take: 10,
      select: { id: true, name: true, avatar: true, points: true },
    }),
  ]);
  return [...pinned, ...rest].slice(0, 10);
}

function avgOf(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export async function getFeaturedPlaces() {
  const places = await prisma.place.findMany({
    where: { category: "HOMESTAY" },
    include: {
      reviews: { select: { rating: true } },
      images: { take: 1, orderBy: { id: "asc" }, select: { url: true } },
    },
  });

  const withStats = places.map((p) => ({
    id: p.id,
    name: p.name,
    address: p.address,
    avatar: p.avatar ?? p.images[0]?.url ?? null,
    avgRating: avgOf(p.reviews.map((r) => r.rating)),
    reviewCount: p.reviews.length,
    featuredRank: p.featuredRank,
  }));

  withStats.sort((a, b) => {
    if (a.featuredRank != null && b.featuredRank != null) return a.featuredRank - b.featuredRank;
    if (a.featuredRank != null) return -1;
    if (b.featuredRank != null) return 1;
    return b.avgRating - a.avgRating;
  });

  return withStats.slice(0, 5);
}

export async function getForumStats() {
  const [members, posts, reviews, comments] = await Promise.all([
    prisma.user.count(),
    prisma.forumPost.count(),
    prisma.forumPost.count({ where: { postType: "REVIEW" } }),
    prisma.forumComment.count(),
  ]);
  return { members, posts, reviews, comments };
}

export type ActivityItem = {
  id: string;
  actorName: string;
  actorAvatar: string;
  verb: "posted" | "commented" | "reacted";
  targetTitle: string;
  postId: string;
  categorySlug: string;
  createdAt: string;
};

export async function getRecentActivity(): Promise<ActivityItem[]> {
  const [posts, comments, reactions] = await Promise.all([
    prisma.forumPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { authorUser: { select: { name: true, avatar: true } } },
    }),
    prisma.forumComment.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        author: { select: { name: true, avatar: true } },
        post: { select: { id: true, title: true, category: true } },
      },
    }),
    prisma.forumReaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, avatar: true } },
        post: { select: { id: true, title: true, category: true } },
      },
    }),
  ]);

  const items: ActivityItem[] = [
    ...posts
      .filter((p) => p.authorUser)
      .map((p) => ({
        id: `post-${p.id}`,
        actorName: p.authorUser!.name,
        actorAvatar: p.authorUser!.avatar,
        verb: "posted" as const,
        targetTitle: p.title,
        postId: p.id,
        categorySlug: enumToSlug(p.category),
        createdAt: p.createdAt.toISOString(),
      })),
    ...comments.map((c) => ({
      id: `comment-${c.id}`,
      actorName: c.author.name,
      actorAvatar: c.author.avatar,
      verb: "commented" as const,
      targetTitle: c.post.title,
      postId: c.post.id,
      categorySlug: enumToSlug(c.post.category),
      createdAt: c.createdAt.toISOString(),
    })),
    ...reactions.map((r) => ({
      id: `reaction-${r.id}`,
      actorName: r.user.name,
      actorAvatar: r.user.avatar,
      verb: "reacted" as const,
      targetTitle: r.post.title,
      postId: r.post.id,
      categorySlug: enumToSlug(r.post.category),
      createdAt: r.createdAt.toISOString(),
    })),
  ];

  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, 8);
}
