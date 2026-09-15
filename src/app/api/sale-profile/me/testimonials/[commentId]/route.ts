import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";

type Params = { params: Promise<{ commentId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { commentId } = await params;
  const comment = await prisma.socialComment.findUnique({ where: { id: commentId }, include: { place: true } });
  if (!comment || comment.place.userId !== actor.id) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  await prisma.socialComment.delete({ where: { id: commentId } });
  return NextResponse.json({ ok: true });
}
