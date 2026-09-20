import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { z } from "zod";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const log = await prisma.requestLog.findUnique({ where: { id } });
  if (!log) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(log);
}

const updateSchema = z.object({ resolved: z.boolean() });

// PATCH - danh dau da xu ly (khong xoa log, chi doi trang thai de admin biet da xem xet)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  try {
    const log = await prisma.requestLog.update({ where: { id }, data: { resolved: parsed.data.resolved } });
    return NextResponse.json(log);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}
