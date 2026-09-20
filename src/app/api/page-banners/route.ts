import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

const schema = z.object({
  slot: z.string().min(1),
  title: z.string().optional(),
  image: imagePathSchema,
});

// GET /api/page-banners?slot=luu-tru-hero -> banner active duy nhat cho slot do (hoac null)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slot = searchParams.get("slot");
  if (!slot) return NextResponse.json({ error: "Thiếu slot" }, { status: 400 });

  const banner = await prisma.pageBanner.findFirst({ where: { slot, active: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(banner);
}

// POST - tao/thay banner cho 1 slot. Vi moi slot chi hien 1 banner active tai 1 thoi
// diem, tu dong tat cac row active cu cung slot truoc khi tao row moi (don gian hoa
// UI quan tri: chi can 1 form "luu la thay", khong can quan ly danh sach nhieu row).
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "luu-tru-settings", "edit");
  if (permError) return permError;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await prisma.pageBanner.updateMany({ where: { slot: parsed.data.slot, active: true }, data: { active: false } });
  const banner = await prisma.pageBanner.create({ data: { ...parsed.data, active: true } });
  return NextResponse.json(banner, { status: 201 });
}
