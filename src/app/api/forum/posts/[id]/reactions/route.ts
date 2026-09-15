import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { forumReactionSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { getIO } from "@/lib/socket-server";
import { forumCategoryRoom, forumPostRoom } from "@/lib/socket-rooms";
import { enumToSlug } from "@/lib/forum";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập để thả cảm xúc" }, { status: 401 });
  }

  if (!rateLimit(`react:${actor.id}`, 60, 60_000)) {
    return NextResponse.json({ error: "Bạn thao tác quá nhanh, vui lòng thử lại sau" }, { status: 429 });
  }

  const { id: postId } = await params;
  const post = await prisma.forumPost.findUnique({
    where: { id: postId },
    select: { id: true, authorUserId: true, category: true },
  });
  if (!post) return NextResponse.json({ error: "Không tìm thấy bài đăng" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = forumReactionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Loại cảm xúc không hợp lệ" }, { status: 400 });
  }

  const existing = await prisma.forumReaction.findUnique({
    where: { postId_userId: { postId, userId: actor.id } },
  });

  // Điểm tương tác của tác giả bài viết — chỉ cộng/trừ khi số lượng reaction thực sự thay đổi
  async function bumpAuthorPoints(delta: number) {
    if (post!.authorUserId) {
      await prisma.user.update({ where: { id: post!.authorUserId }, data: { points: { increment: delta } } });
    }
  }

  let active: string | null;
  if (existing && existing.type === parsed.data.type) {
    await prisma.forumReaction.delete({ where: { id: existing.id } });
    await bumpAuthorPoints(-1);
    active = null;
  } else {
    await prisma.forumReaction.upsert({
      where: { postId_userId: { postId, userId: actor.id } },
      update: { type: parsed.data.type },
      create: { postId, userId: actor.id, type: parsed.data.type },
    });
    if (!existing) await bumpAuthorPoints(1);
    active = parsed.data.type;
  }

  const total = await prisma.forumReaction.count({ where: { postId } });
  const io = getIO();
  io?.to(forumPostRoom(postId)).emit("reaction:update", { postId, total });
  io?.to(forumCategoryRoom(enumToSlug(post.category))).emit("post:stats", { postId, reactionsCount: total });

  return NextResponse.json({ active });
}
