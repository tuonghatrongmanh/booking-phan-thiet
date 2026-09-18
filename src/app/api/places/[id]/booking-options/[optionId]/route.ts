import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { optionSchema } from "@/lib/booking-option-schema";

type Params = { params: Promise<{ id: string; optionId: string }> };

async function authorize() {
  const { admin, error } = await requireSectionAccess("homestay");
  if (error || !admin) return { error: error! };
  const permError = requireCreateOrEdit(admin, "homestay", "edit");
  if (permError) return { error: permError };
  return { admin };
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const { id, optionId } = await params;
  const existing = await prisma.placeBookingOption.findFirst({ where: { id: optionId, placeId: id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy gói phòng" }, { status: 404 });

  const parsed = optionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const data = parsed.data;
  const option = await prisma.placeBookingOption.update({
    where: { id: optionId },
    data: {
      label: data.label,
      depositVnd: data.depositVnd,
      priceVnd: data.priceVnd ?? null,
      maxUnits: data.wholeProperty ? 1 : data.maxUnits,
      wholeProperty: data.wholeProperty,
    },
  });
  return NextResponse.json(option);
}

// Xóa gói KHÔNG xóa các đơn đã đặt trước đó (đơn giữ ảnh chụp tên gói - optionLabel).
export async function DELETE(_req: NextRequest, { params }: Params) {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const { id, optionId } = await params;
  const existing = await prisma.placeBookingOption.findFirst({ where: { id: optionId, placeId: id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy gói phòng" }, { status: 404 });

  // Không cho xóa gói đang giữ chỗ cho khách đã cọc (chưa trả phòng) - xóa sẽ làm mất
  // số liệu phòng đã bị chiếm và có thể dẫn tới đặt trùng phòng.
  const activePaid = await prisma.stayBookingInquiry.count({
    where: { optionId, depositStatus: "PAID", status: { not: "CANCELLED" }, checkoutDate: { gte: new Date() } },
  });
  if (activePaid > 0) {
    return NextResponse.json(
      { error: "Gói này đang có khách đã cọc giữ phòng, không thể xóa. Hãy đợi khách trả phòng hoặc huỷ đơn trước." },
      { status: 400 }
    );
  }

  await prisma.placeBookingOption.delete({ where: { id: optionId } });
  return NextResponse.json({ ok: true });
}
