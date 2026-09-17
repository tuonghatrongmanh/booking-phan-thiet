import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess } from "@/lib/admin-action";

// GET /api/admin/password-reset-requests - danh sách yêu cầu "quên mật khẩu" người
// dùng tự gửi (xem /api/auth/forgot-password), để admin hỗ trợ thủ công khi hệ
// thống CHƯA cấu hình RESEND_API_KEY (email không tự gửi được). Chỉ hiện token CHƯA
// được xử lý (chưa dùng, còn hạn) - token đã dùng/hết hạn xem như đã xong/người
// dùng tự làm được qua email thật.
export async function GET() {
  const { error } = await requireSectionAccess("password-reset-requests");
  if (error) return error;

  const requests = await prisma.passwordResetToken.findMany({
    where: { usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true, phone: true } } },
  });

  return NextResponse.json({ items: requests });
}
