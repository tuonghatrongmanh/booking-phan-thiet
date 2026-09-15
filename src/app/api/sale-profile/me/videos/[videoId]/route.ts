import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";

type Params = { params: Promise<{ videoId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const { videoId } = await params;
  const video = await prisma.placeVideo.findUnique({ where: { id: videoId }, include: { place: true } });
  if (!video || video.place.userId !== actor.id) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  await prisma.placeVideo.delete({ where: { id: videoId } });
  return NextResponse.json({ ok: true });
}
