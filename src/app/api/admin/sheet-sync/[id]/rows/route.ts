import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { previewSheet } from "@/lib/sheet-sync";

type Params = { params: Promise<{ id: string }> };

// GET /api/admin/sheet-sync/[id]/rows - doc truc tiep tu file Excel/Sheets (khong qua
// DB) de admin xem luoi o that (mau + gia tri) cua tab thang hien tai, dung cho man
// hinh anh xa cot ngay/cot trang thai theo tung villa/xe.
export async function GET(_req: Request, { params }: Params) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const source = await prisma.sheetSyncSource.findUnique({
    where: { id },
    include: { mappings: { include: { place: { select: { name: true } } } } },
  });
  if (!source) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  try {
    const preview = await previewSheet(source.sheetId, source.sheetNamePattern);
    return NextResponse.json({
      ...preview,
      mappings: source.mappings.map((m) => ({
        id: m.id,
        dayColumn: m.dayColumn,
        statusColumn: m.statusColumn,
        placeId: m.placeId,
        placeName: m.place.name,
        label: m.label,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
