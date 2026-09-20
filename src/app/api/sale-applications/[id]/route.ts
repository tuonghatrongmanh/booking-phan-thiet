import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  note: z.string().trim().nullable().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireSectionAccess("sale-agents");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "sale-agents", "edit");
  if (permError) return permError;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.saleApplication.findUnique({ where: { id }, include: { user: true } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  try {
    const application = await prisma.$transaction(async (tx) => {
      const updated = await tx.saleApplication.update({
        where: { id },
        data: { status: parsed.data.status, note: parsed.data.note ?? undefined },
      });

      // Duyet don -> tu dong tao ho so cong khai (Place category SALE) + lien ket
      // userId ngay, de sale co the vao "Ho so Sale" trong trang tai khoan tu hoan
      // thien. Chi tao 1 lan - neu da co Place lien ket voi user nay roi (vd duyet
      // lai lan 2) thi khong tao trung.
      if (parsed.data.status === "APPROVED") {
        const alreadyLinked = await tx.place.findUnique({ where: { userId: existing.userId } });
        if (!alreadyLinked) {
          await tx.place.create({
            data: {
              category: "SALE",
              status: "TRUSTED",
              userId: existing.userId,
              name: existing.fullName || existing.user.name,
              phone: existing.user.phone,
              avatar: existing.user.avatar,
            },
          });
        }
      }

      return updated;
    });
    return NextResponse.json(application);
  } catch (err) {
    console.error("[sale-applications] cập nhật thất bại", err);
    return NextResponse.json({ error: "Không thể cập nhật đơn (có thể số điện thoại đã trùng với hồ sơ khác)" }, { status: 500 });
  }
}
