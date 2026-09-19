import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";

const REDEMPTION_STATUS_LABEL: Record<string, string> = {
  FULFILLED: "Đơn đổi thưởng đã được xác nhận & trao thưởng",
  CANCELLED: "Đơn đổi thưởng đã bị huỷ",
};

const RENTAL_STATUS_LABEL: Record<string, string> = {
  CONTACTED: "Yêu cầu thuê xe đã được liên hệ xác nhận",
  DONE: "Chuyến thuê xe đã hoàn tất",
  CANCELLED: "Yêu cầu thuê xe đã bị huỷ",
};

// GET /api/notifications - thong bao cho nguoi dung (khong luu bang rieng, tinh
// truc tiep tu Redemption/RentalInquiry da duoc admin xu ly gan day - giong y het
// cach /api/admin/notifications lam voi cac bang khac). Client tu theo doi da
// xem/chua qua localStorage bang cach so sanh thoi gian, khong luu trang thai doc
// o server.
export async function GET() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ items: [] });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [redemptions, rentalInquiries, stayInquiries, saleTasks] = await Promise.all([
    prisma.redemption.findMany({
      where: { userId: actor.id, status: { in: ["FULFILLED", "CANCELLED"] }, updatedAt: { gte: since } },
      orderBy: { updatedAt: "desc" },
      take: 15,
      include: { reward: { select: { name: true } } },
    }),
    prisma.rentalInquiry.findMany({
      where: {
        userId: actor.id,
        updatedAt: { gte: since },
        OR: [{ status: { in: ["CONTACTED", "DONE", "CANCELLED"] } }, { depositStatus: "PAID" }],
      },
      orderBy: { updatedAt: "desc" },
      take: 15,
      include: { place: { select: { name: true } } },
    }),
    prisma.stayBookingInquiry.findMany({
      where: {
        userId: actor.id,
        updatedAt: { gte: since },
        OR: [{ status: { in: ["CONTACTED", "DONE", "CANCELLED"] } }, { depositStatus: "PAID" }],
      },
      orderBy: { updatedAt: "desc" },
      take: 15,
      include: { place: { select: { name: true } } },
    }),
    // Sale uy tín: admin vừa giao / duyệt / từ chối nhiệm vụ
    prisma.saleTask.findMany({
      where: { place: { userId: actor.id }, status: { in: ["ASSIGNED", "DONE", "REJECTED"] }, updatedAt: { gte: since } },
      orderBy: { updatedAt: "desc" },
      take: 10,
      select: { id: true, status: true, title: true, bonusPoints: true, placeId: true, updatedAt: true },
    }),
  ]);

  const redemptionItems = redemptions.map((r) => ({
    id: `redemption:${r.id}`,
    type: r.status === "FULFILLED" ? ("system" as const) : ("warning" as const),
    title: REDEMPTION_STATUS_LABEL[r.status] ?? "Cập nhật đơn đổi thưởng",
    description: `"${r.reward.name}"${r.note ? ` — ${r.note}` : ""}`,
    href: "/game-trung-thuong?tab=history",
    createdAt: r.updatedAt,
  }));

  const rentalItems = rentalInquiries.map((r) => ({
    id: `rental:${r.id}`,
    type: r.status === "DONE" ? ("system" as const) : r.status === "CANCELLED" ? ("warning" as const) : ("unread" as const),
    title:
      r.status === "CANCELLED" || r.status === "DONE" || r.status === "CONTACTED"
        ? (RENTAL_STATUS_LABEL[r.status] ?? "Cập nhật yêu cầu thuê xe")
        : "Đã nhận cọc - giữ xe thành công",
    description: r.place.name,
    href: r.depositRef ? `/tra-cuu-dat-cho?ref=${r.depositRef}` : "/thue-xe",
    createdAt: r.updatedAt,
  }));

  const stayItems = stayInquiries.map((r) => ({
    id: `stay:${r.id}`,
    type: r.status === "DONE" || r.depositStatus === "PAID" ? ("system" as const) : r.status === "CANCELLED" ? ("warning" as const) : ("unread" as const),
    title:
      r.status === "CANCELLED"
        ? "Yêu cầu đặt phòng đã bị huỷ"
        : r.status === "DONE"
          ? "Chuyến lưu trú đã hoàn tất"
          : r.status === "CONTACTED"
            ? "Yêu cầu đặt phòng đã được liên hệ xác nhận"
            : "Đã nhận cọc - giữ phòng thành công",
    description: r.place.name,
    href: r.depositRef ? `/tra-cuu-dat-cho?ref=${r.depositRef}` : `/luu-tru/${r.placeId}`,
    createdAt: r.updatedAt,
  }));

  const taskItems = saleTasks.map((t) => ({
    id: `sale-task:${t.id}:${t.status}`,
    type: t.status === "ASSIGNED" ? ("important" as const) : t.status === "DONE" ? ("system" as const) : ("warning" as const),
    title: t.status === "ASSIGNED" ? "Bạn có nhiệm vụ mới" : t.status === "DONE" ? `Nhiệm vụ hoàn thành${t.bonusPoints ? ` (+${t.bonusPoints} điểm)` : ""}` : "Nhiệm vụ không được duyệt",
    description: t.title ?? "Xem chi tiết trong hồ sơ Sale của bạn",
    href: `/sale/${t.placeId}`,
    createdAt: t.updatedAt,
  }));

  const items = [...redemptionItems, ...rentalItems, ...stayItems, ...taskItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json({ items });
}
