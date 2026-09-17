import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { generateRandomPassword } from "@/lib/security-gate";

type Params = { params: Promise<{ id: string }> };

// POST /api/admin/password-reset-requests/:id/resolve - admin tạo mật khẩu tạm cho
// người dùng ĐÃ tự gửi yêu cầu quên-mật-khẩu (không cần master-password như reset
// Sale/Staff, vì đây là thực hiện hộ một yêu cầu người dùng đã tự xác nhận, không
// phải admin tự ý quyết định đổi mật khẩu người khác).
export async function POST(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireSectionAccess("password-reset-requests");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "password-reset-requests", "edit");
  if (permError) return permError;

  const { id } = await params;
  const record = await prisma.passwordResetToken.findUnique({ where: { id } });
  if (!record || record.usedAt) {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ hoặc đã được xử lý" }, { status: 404 });
  }

  const newPassword = generateRandomPassword();
  const hash = await bcrypt.hash(newPassword, 10);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);

  return NextResponse.json({ newPassword });
}
