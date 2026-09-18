import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { optionSchema } from "@/lib/booking-option-schema";

const MAX_OPTIONS = 12;

type Params = { params: Promise<{ id: string }> };

// POST /api/places/:id/booking-options - thêm "gói đặt phòng" (phòng đơn/phòng đôi/nguyên
// căn...) cho 1 homestay, mỗi gói có tiền cọc riêng. Gói "nguyên căn" luôn chỉ có 1 đơn vị.
export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireSectionAccess("homestay");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "homestay", "edit");
  if (permError) return permError;

  const { id } = await params;
  const place = await prisma.place.findUnique({ where: { id }, select: { category: true } });
  if (!place || place.category !== "HOMESTAY") {
    return NextResponse.json({ error: "Không tìm thấy homestay" }, { status: 404 });
  }

  const parsed = optionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const count = await prisma.placeBookingOption.count({ where: { placeId: id } });
  if (count >= MAX_OPTIONS) {
    return NextResponse.json({ error: `Tối đa ${MAX_OPTIONS} gói phòng cho mỗi chỗ ở` }, { status: 400 });
  }

  const data = parsed.data;
  const option = await prisma.placeBookingOption.create({
    data: {
      placeId: id,
      label: data.label,
      depositVnd: data.depositVnd,
      priceVnd: data.priceVnd ?? null,
      maxUnits: data.wholeProperty ? 1 : data.maxUnits,
      wholeProperty: data.wholeProperty,
      sortOrder: count,
    },
  });
  return NextResponse.json(option, { status: 201 });
}
