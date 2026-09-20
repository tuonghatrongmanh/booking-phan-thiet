import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { PARTNER_CATEGORIES, partnerChangeSchema } from "@/lib/partner-schema";
import { pingIndexNow, placePublicUrl } from "@/lib/indexnow";

export * from "@/lib/partner-schema";

// Cổng đối tác: chủ homestay / chủ xe (tài khoản User được admin gán vào địa điểm) xem đơn + lịch của chính mình,
// còn sửa giá/mô tả/ảnh thì gửi yêu cầu để SuperAdmin duyệt (không áp dụng ngay).
// Người đang đăng nhập (User) + các chỗ họ quản lý. null = chưa đăng nhập bằng tài khoản thành viên.
export async function getPartnerContext() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") return null;
  const places = await prisma.place.findMany({
    where: { partnerUserId: actor.id, category: { in: [...PARTNER_CATEGORIES] } },
    select: { id: true, name: true, category: true, hidden: true, avatar: true, status: true, description: true, phone: true, priceFromVnd: true, priceHolidayVnd: true, totalRooms: true },
    orderBy: { name: "asc" },
  });
  return { userId: actor.id, places };
}

// Áp dụng 1 yêu cầu đã duyệt (chỉ các trường trong danh sách cho phép; payload lạ bị bỏ qua)
export async function applyPartnerChange(placeId: string, rawPayload: unknown): Promise<void> {
  const parsed = partnerChangeSchema.safeParse(rawPayload);
  if (!parsed.success) throw new Error("Nội dung yêu cầu không hợp lệ");
  const { addImages, ...fields } = parsed.data;
  const place = await prisma.$transaction(async (tx) => {
    const p = await tx.place.update({ where: { id: placeId }, data: fields });
    if (addImages) await tx.placeImage.createMany({ data: addImages.map((url) => ({ placeId, url })) });
    return p;
  });
  pingIndexNow([placePublicUrl(place)]);
}
