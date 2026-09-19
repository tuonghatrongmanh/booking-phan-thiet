import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { invalidateUiSlotsCache, isUiSlotId } from "@/lib/ui-slots";
import { slotSchema } from "@/lib/theme-schema";

type Ctx = { params: Promise<{ slot: string }> };

// PUT /api/admin/ui-slots/[slot] { imageUrl } - thay icon/nut bam bang anh/GIF
export async function PUT(req: NextRequest, { params }: Ctx) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const { slot } = await params;
  if (!isUiSlotId(slot)) return NextResponse.json({ error: "Vị trí không hợp lệ" }, { status: 400 });

  const parsed = slotSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const row = await prisma.uiIconSlot.upsert({
    where: { slot },
    create: { slot, imageUrl: parsed.data.imageUrl },
    update: { imageUrl: parsed.data.imageUrl },
  });
  await logAdminAction(admin, "update", "ui-slot", slot, "Thay icon/nút bấm bằng ảnh tùy chỉnh");
  invalidateUiSlotsCache();
  revalidatePath("/", "layout");
  return NextResponse.json(row);
}

// DELETE - khoi phuc icon/nut mac dinh
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const { slot } = await params;
  if (!isUiSlotId(slot)) return NextResponse.json({ error: "Vị trí không hợp lệ" }, { status: 400 });

  await prisma.uiIconSlot.deleteMany({ where: { slot } });
  await logAdminAction(admin, "delete", "ui-slot", slot, "Khôi phục icon/nút bấm mặc định");
  invalidateUiSlotsCache();
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
