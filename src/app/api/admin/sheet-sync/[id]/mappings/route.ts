import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";

type Params = { params: Promise<{ id: string }> };

const COLUMN_RE = /^[A-Za-z]{1,2}$/;

const saveSchema = z.object({
  mappings: z.array(
    z.object({
      placeId: z.string().min(1),
      dayColumn: z.string().regex(COLUMN_RE),
      statusColumn: z.string().regex(COLUMN_RE),
      label: z.string().optional().default(""),
    })
  ),
});

// POST /api/admin/sheet-sync/[id]/mappings - luu toan bo anh xa villa/xe -> cot cho 1
// nguon (ghi de danh sach cu) - dung khi admin thiet lap/chinh sua anh xa.
export async function POST(req: NextRequest, { params }: Params) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const parsed = saveSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Thông tin không hợp lệ" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    await tx.sheetRowMapping.deleteMany({ where: { sourceId: id } });
    if (parsed.data.mappings.length > 0) {
      await tx.sheetRowMapping.createMany({
        data: parsed.data.mappings.map((m) => ({
          sourceId: id,
          placeId: m.placeId,
          dayColumn: m.dayColumn.toUpperCase(),
          statusColumn: m.statusColumn.toUpperCase(),
          label: m.label,
        })),
      });
    }
  });

  return NextResponse.json({ ok: true });
}
