import { NextRequest, NextResponse } from "next/server";
import { voidCommission } from "@/lib/referral";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { emailBookingCancelled } from "@/lib/booking-notify";
import { summaryFromRental } from "@/lib/booking-summary";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["PENDING", "CONTACTED", "DONE", "CANCELLED"]),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireSectionAccess("car-rentals");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "car-rentals", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const existing = await prisma.rentalInquiry.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy đơn" }, { status: 404 });

  const inquiry = await prisma.rentalInquiry.update({
    where: { id },
    data: { status: parsed.data.status },
    include: { place: { select: { name: true } } },
  });

  // Báo cho khách khi đơn bị huỷ (đơn huỷ cũng không còn giữ xe - xem booking-availability.ts)
  if (parsed.data.status === "CANCELLED" && existing.status !== "CANCELLED") {
    void emailBookingCancelled(summaryFromRental(inquiry));
    void voidCommission("rental", id);
  }

  return NextResponse.json({ item: inquiry });
}
