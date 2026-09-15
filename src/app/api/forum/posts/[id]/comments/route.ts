import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { forumCommentSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { getIO } from "@/lib/socket-server";
import { forumCategoryRoom, forumPostRoom } from "@/lib/socket-rooms";
import { enumToSlug } from "@/lib/forum";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập để bình luận" }, { status: 401 });
  }

  if (!rateLimit(`comment:${actor.id}`, 20, 60_000)) {
    return NextResponse.json({ error: "Bạn bình luận quá nhanh, vui lòng thử lại sau" }, { status: 429 });
  }

  const { id: postId } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id: postId }, select: { id: true, category: true } });
  if (!post) return NextResponse.json({ error: "Không tìm thấy bài đăng" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = forumCommentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const comment = await prisma.forumComment.create({
    data: { content: parsed.data.content, postId, authorId: actor.id },
    include: { author: { select: { id: true, name: true, avatar: true } } },
  });

  const commentsCount = await prisma.forumComment.count({ where: { postId } });
  const io = getIO();
  const payload = { ...comment, createdAt: comment.createdAt.toISOString() };
  io?.to(forumPostRoom(postId)).emit("comment:new", payload);
  io?.to(forumCategoryRoom(enumToSlug(post.category))).emit("post:stats", { postId, commentsCount });

  return NextResponse.json(comment, { status: 201 });
}
