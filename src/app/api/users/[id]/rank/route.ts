import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { z } from "zod";

const schema = z.object({ rankOverride: z.number().int().nullable() });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  try {
    const user = await prisma.user.update({ where: { id }, data: { rankOverride: parsed.data.rankOverride } });
    return NextResponse.json({ id: user.id, rankOverride: user.rankOverride });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}
