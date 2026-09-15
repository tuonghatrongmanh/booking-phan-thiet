import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/admin-action";

async function requireSuperAdmin() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return { admin: null, error: error! };
  if (admin.role !== "SUPER_ADMIN") {
    return { admin: null, error: NextResponse.json({ error: "Chỉ quản trị viên cấp cao mới có quyền này" }, { status: 403 }) };
  }
  return { admin, error: null };
}

export async function GET(req: Request) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const status = new URL(req.url).searchParams.get("status") ?? "PENDING";
  const where = status === "ALL" ? {} : { status: status as "PENDING" | "APPROVED" | "REJECTED" };

  const items = await prisma.pendingChange.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      requestedBy: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true } },
    },
  });
  return NextResponse.json({ items });
}
