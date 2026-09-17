import { prisma } from "@/lib/prisma";
import type { Admin } from "@prisma/client";

// Ghi nhật ký cho các hành động SUPER_ADMIN nhạy cảm nhất (đặt lại mật khẩu người
// khác, đình chỉ/cấm Sale, đổi mật khẩu chủ...) - fire-and-forget, không bao giờ
// được làm thất bại hành động chính chỉ vì ghi log lỗi.
export async function logAdminAction(
  admin: Admin,
  action: string,
  targetType: string,
  targetId: string,
  detail?: string
): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: { adminId: admin.id, adminName: admin.name, adminEmail: admin.email, action, targetType, targetId, detail },
    });
  } catch (err) {
    console.error("[audit-log] ghi log thất bại:", err);
  }
}
