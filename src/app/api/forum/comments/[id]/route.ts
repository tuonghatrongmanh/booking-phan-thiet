import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requestDeleteOrHide } from "@/lib/admin-action";
import { getIO } from "@/lib/socket-server";
import { forumCategoryRoom, forumPostRoom } from "@/lib/socket-rooms";
import { enumToSlug } from "@/lib/forum";

// Xoa binh luan vi pham (kiem duyet tu admin) - khac voi POST tao binh luan (chi
// nguoi dung thuong duoc tao), xoa la hanh dong quan tri nen bat buoc requireAdmin().
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const comment = await prisma.forumComment.findUnique({
    where: { id },
    select: { postId: true, content: true, post: { select: { category: true } } },
  });
  if (!comment) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const result = await requestDeleteOrHide({
    admin,
    section: "forum-comments",
    action: "delete",
    targetType: "ForumComment",
    targetId: id,
    targetLabel: comment.content.slice(0, 80),
  });
  if (result.outcome !== "direct") return result.response;

  await prisma.forumComment.delete({ where: { id } });

  const commentsCount = await prisma.forumComment.count({ where: { postId: comment.postId } });
  const io = getIO();
  io?.to(forumPostRoom(comment.postId)).emit("comment:deleted", { id, postId: comment.postId });
  io?.to(forumCategoryRoom(enumToSlug(comment.post.category))).emit("post:stats", {
    postId: comment.postId,
    commentsCount,
  });

  return NextResponse.json({ ok: true });
}
