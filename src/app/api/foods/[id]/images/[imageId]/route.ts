import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";

type Params = { params: Promise<{ id: string; imageId: string }> };

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "foods", "edit");
  if (permError) return permError;

  const { imageId } = await params;
  try {
    await prisma.foodImage.delete({ where: { id: imageId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}
