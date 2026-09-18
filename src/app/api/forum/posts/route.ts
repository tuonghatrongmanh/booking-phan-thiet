import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { forumPostSchema } from "@/lib/validation";
import { isForumSlug, slugToEnum, extractHashtags } from "@/lib/forum";
import { rateLimit } from "@/lib/rate-limit";
import { getIO } from "@/lib/socket-server";
import { forumCategoryRoom } from "@/lib/socket-rooms";
import { extractUrls, findMaliciousUrls } from "@/lib/link-scan";

// reactions loc theo userId ("" -> khong bao gio khop) de client biet minh da tha cam
// xuc loai gi cho tung bai ngay tu du lieu dau, khong phai doan mo hinh o feed.
function postInclude(userId: string) {
  return {
    authorUser: { select: { id: true, name: true, avatar: true } },
    authorAdmin: { select: { id: true, name: true } },
    media: true,
    hashtags: { include: { hashtag: { select: { tag: true } } } },
    reactions: { where: { userId }, select: { type: true } },
    _count: { select: { comments: true, reactions: true } },
  } as const;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("category") ?? "";
  if (!isForumSlug(slug)) {
    return NextResponse.json({ error: "Danh mục không hợp lệ" }, { status: 400 });
  }
  const category = slugToEnum(slug);
  const postType = searchParams.get("type");
  const since = searchParams.get("since");
  const actor = await getActor();

  const posts = await prisma.forumPost.findMany({
    where: {
      category,
      ...(postType ? { postType: postType as never } : {}),
      ...(since ? { createdAt: { gt: new Date(since) } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: postInclude(actor?.type === "user" ? actor.id : ""),
  });

  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const actor = await getActor();
  if (!actor) {
    return NextResponse.json({ error: "Vui lòng đăng nhập để đăng bài" }, { status: 401 });
  }

  if (!rateLimit(`post:${actor.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Bạn đăng bài quá nhanh, vui lòng thử lại sau ít phút" }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const slug = body?.category as string | undefined;
  if (!slug || !isForumSlug(slug)) {
    return NextResponse.json({ error: "Danh mục không hợp lệ" }, { status: 400 });
  }

  const parsed = forumPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { title, content, postType, locationTag, media } = parsed.data;

  const urlsInContent = extractUrls(`${title} ${content}`);
  const maliciousUrls = await findMaliciousUrls(urlsInContent);
  if (maliciousUrls.length > 0) {
    return NextResponse.json({ error: "Bài viết chứa liên kết bị đánh dấu không an toàn, vui lòng gỡ bỏ" }, { status: 400 });
  }

  const category = slugToEnum(slug);
  const tags = extractHashtags(`${title} ${content}`);

  // Gom tao bai + gan hashtag vao 1 transaction: dam bao du lieu nhat quan
  // (khong bi tao post "mo coi" thieu hashtag) khi nhieu nguoi dang bai cung luc.
  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.forumPost.create({
      data: {
        category,
        postType,
        title,
        content,
        locationTag,
        authorUserId: actor.type === "user" ? actor.id : undefined,
        authorAdminId: actor.type === "admin" ? actor.id : undefined,
        media: { create: media.map((m) => ({ url: m.url, type: m.type })) },
      },
    });

    for (const tag of tags) {
      const hashtag = await tx.hashtag.upsert({
        where: { tag },
        update: { count: { increment: 1 } },
        create: { tag, count: 1 },
      });
      await tx.forumPostHashtag.create({ data: { postId: created.id, hashtagId: hashtag.id } }).catch(() => {});
    }

    return created;
  });

  // Phat realtime cho nhung ai dang mo dien dan nay - truy van lai kem quan he du
  // (author/media/hashtags/_count) de gui dung shape ma ForumFeed/ForumPostCard can,
  // tach khoi transaction o tren de khong keo dai thoi gian giu lock khi tai cao.
  const fullPost = await prisma.forumPost.findUnique({ where: { id: post.id }, include: postInclude("") });
  getIO()
    ?.to(forumCategoryRoom(slug))
    .emit("post:new", { ...fullPost, createdAt: fullPost!.createdAt.toISOString() });


  return NextResponse.json(post, { status: 201 });
}
