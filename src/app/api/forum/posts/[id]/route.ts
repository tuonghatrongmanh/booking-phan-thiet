import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const post = await prisma.forumPost.findUnique({
    where: { id },
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
  });

  if (!post) {
    return NextResponse.json({ error: "Không tìm thấy bài đăng" }, { status: 404 });
  }

  prisma.forumPost.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

  return NextResponse.json(post);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

  const { id } = await params;
  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "Không tìm thấy bài đăng" }, { status: 404 });

  const isOwner = actor.type === "user" ? post.authorUserId === actor.id : post.authorAdminId === actor.id;
  const isAdmin = actor.type === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Bạn không có quyền xoá bài này" }, { status: 403 });
  }

  await prisma.forumPost.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
