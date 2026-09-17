import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
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

  const inquiry = await prisma.rentalInquiry.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ item: inquiry });
}
