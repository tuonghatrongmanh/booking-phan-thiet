import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";

const STATUS_LABEL: Record<string, string> = {
  FULFILLED: "Đơn đổi thưởng đã được xác nhận & trao thưởng",
  CANCELLED: "Đơn đổi thưởng đã bị huỷ",
};

// GET /api/notifications - thong bao cho nguoi dung (khong luu bang rieng, tinh
// truc tiep tu Redemption da duoc admin xu ly gan day - giong y het cach
// /api/admin/notifications lam voi cac bang khac). Client tu theo doi da xem/chua
// qua localStorage bang cach so sanh thoi gian, khong luu trang thai doc o server.
export async function GET() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ items: [] });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const redemptions = await prisma.redemption.findMany({
    where: { userId: actor.id, status: { in: ["FULFILLED", "CANCELLED"] }, updatedAt: { gte: since } },
    orderBy: { updatedAt: "desc" },
    take: 15,
    include: { reward: { select: { name: true } } },
  });

  const items = redemptions.map((r) => ({
    id: r.id,
    type: r.status === "FULFILLED" ? ("system" as const) : ("warning" as const),
    title: STATUS_LABEL[r.status] ?? "Cập nhật đơn đổi thưởng",
    description: `"${r.reward.name}"${r.note ? ` — ${r.note}` : ""}`,
    href: "/game-trung-thuong?tab=history",
    createdAt: r.updatedAt,
  }));

  return NextResponse.json({ items });
}
