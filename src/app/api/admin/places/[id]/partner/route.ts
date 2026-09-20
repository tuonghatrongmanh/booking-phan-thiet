import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { PARTNER_CATEGORIES } from "@/lib/partner";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Email không hợp lệ").nullable() });

// PUT /api/admin/places/:id/partner { email | null } - gán (hoặc gỡ) tài khoản đối tác quản lý homestay/xe này.
// Chỉ SuperAdmin vì đối tác sẽ thấy tên + số điện thoại khách đặt chỗ.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });

  const place = await prisma.place.findUnique({ where: { id }, select: { id: true, name: true, category: true } });
  if (!place) return NextResponse.json({ error: "Không tìm thấy địa điểm" }, { status: 404 });
  if (!(PARTNER_CATEGORIES as readonly string[]).includes(place.category)) return NextResponse.json({ error: "Chỉ gán đối tác cho homestay hoặc xe thuê" }, { status: 400 });

  if (parsed.data.email === null) {
    await prisma.place.update({ where: { id }, data: { partnerUserId: null } });
    void logAdminAction(admin, "unassign-partner", "Place", id, `Gỡ đối tác khỏi ${place.name}`);
    return NextResponse.json({ ok: true, partner: null });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true, name: true, email: true } });
  if (!user) return NextResponse.json({ error: "Chưa có tài khoản với email này. Đối tác cần đăng ký tài khoản trên website trước." }, { status: 404 });
  await prisma.place.update({ where: { id }, data: { partnerUserId: user.id } });
  void logAdminAction(admin, "assign-partner", "Place", id, `Gán ${user.email} quản lý ${place.name}`);
  return NextResponse.json({ ok: true, partner: user });
}
