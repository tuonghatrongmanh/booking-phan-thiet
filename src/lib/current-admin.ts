import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Lay ban ghi Admin day du (role/permissions/active) tu session hien tai - dung o cac
// trang Server Component can biet chi tiet quyen (vd Layout de an muc sidebar, hoac
// trang /admin de redirect nhan vien ra khoi Tong quan).
export async function getCurrentAdmin() {
  const session = await auth();
  const isAdmin = (session?.user as { type?: string } | undefined)?.type === "admin";
  if (!isAdmin) return null;
  const id = (session!.user as { id: string }).id;
  return prisma.admin.findUnique({ where: { id } });
}
