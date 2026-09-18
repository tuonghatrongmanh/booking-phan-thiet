import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";
import { verifyTwoFactorToken } from "@/lib/two-factor";
import { logAdminAction } from "@/lib/audit-log";
import { z } from "zod";

const schema = z.object({
  secret: z.string().min(1),
  token: z.string().trim().regex(/^\d{6}$/, "Mã phải gồm 6 chữ số"),
});

// POST /api/admin/account/two-factor/confirm - xác nhận admin đã scan QR và nhập
// đúng 1 mã từ app TOTP - chỉ lúc này mới thực sự bật 2FA + lưu secret.
export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const valid = verifyTwoFactorToken(parsed.data.token, parsed.data.secret);
  if (!valid) {
    return NextResponse.json({ error: "Mã xác thực không đúng, vui lòng thử lại" }, { status: 400 });
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { twoFactorEnabled: true, twoFactorSecret: parsed.data.secret },
  });

  void logAdminAction(admin, "enable-2fa", "Admin", admin.id);

  return NextResponse.json({ ok: true });
}
