import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requirePlaceEdit } from "@/lib/admin-action";

type Params = { params: Promise<{ id: string; imageId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { imageId } = await params;
  const image = await prisma.placeImage.findUnique({ where: { id: imageId }, select: { place: { select: { category: true } } } });
  if (!image) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  const permError = requirePlaceEdit(admin, image.place.category);
  if (permError) return permError;
  try {
    await prisma.placeImage.delete({ where: { id: imageId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}
