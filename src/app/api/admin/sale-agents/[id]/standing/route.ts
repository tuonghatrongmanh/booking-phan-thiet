import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { z } from "zod";
import { recalcSalePoints } from "@/lib/sale-points-server";

type Params = { params: Promise<{ id: string }> };

function requireSuperAdmin(role: string) {
  if (role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ SuperAdmin mới có quyền này" }, { status: 403 });
  }
  return null;
}

const createSchema = z.object({
  action: z.enum(["SUSPENDED", "BANNED"]),
  reason: z.string().trim().min(1),
  suspendedUntil: z.string().trim().nullable().optional(),
});

// POST /api/admin/sale-agents/[id]/standing - dinh chi (co han/khong xac dinh) hoac
// cam vinh vien 1 Sale. id la Place.id.
export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireSuperAdmin(admin.role);
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const place = await prisma.place.findUnique({ where: { id } });
  if (!place || place.category !== "SALE") return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const standing = await prisma.saleStanding.upsert({
    where: { placeId: id },
    update: {
      action: parsed.data.action,
      reason: parsed.data.reason,
      suspendedUntil: parsed.data.suspendedUntil ? new Date(parsed.data.suspendedUntil) : null,
      active: true,
      createdById: admin.id,
      appealText: null,
      appealCreatedAt: null,
      appealStatus: null,
      appealNote: null,
      appealResolvedAt: null,
    },
    create: {
      placeId: id,
      action: parsed.data.action,
      reason: parsed.data.reason,
      suspendedUntil: parsed.data.suspendedUntil ? new Date(parsed.data.suspendedUntil) : null,
      createdById: admin.id,
    },
  });

  void recalcSalePoints(id).catch(() => {});
  return NextResponse.json(standing, { status: 201 });
}

const patchSchema = z.object({ active: z.boolean() });

// PATCH - bat/tat nhanh (tam ngung ap dung ma khong xoa han)
export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireSuperAdmin(admin.role);
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  try {
    const standing = await prisma.saleStanding.update({ where: { placeId: id }, data: { active: parsed.data.active } });
    void recalcSalePoints(id).catch(() => {});
    return NextResponse.json(standing);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

// DELETE - go hoan toan dinh chi/cam
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireSuperAdmin(admin.role);
  if (permError) return permError;

  const { id } = await params;
  try {
    await prisma.saleStanding.delete({ where: { placeId: id } });
    void recalcSalePoints(id).catch(() => {});
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}
