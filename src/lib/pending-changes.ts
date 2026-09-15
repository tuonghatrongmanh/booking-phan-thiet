import { prisma } from "@/lib/prisma";
import type { PendingChange } from "@prisma/client";

// Ap dung 1 PendingChange sau khi SuperAdmin bam Duyet - moi targetType can 1 nhanh
// rieng vi cach "xoa"/"an"/"sua" khac nhau tuy model. Them targetType moi khi wire
// them 1 muc admin vao he thong duyet (xem README trong request-thread neu can doi
// chieu lai danh sach muc da yeu cau).
export async function applyPendingChange(change: PendingChange) {
  const { action, targetType, targetId, payload } = change;

  if (action === "HIDE") {
    if (targetType === "Place") {
      await prisma.place.update({ where: { id: targetId! }, data: { hidden: true } });
      return;
    }
    if (targetType === "StayArea" || targetType === "StayAmenity" || targetType === "StayTypeSetting") {
      await prisma.$transaction(async (tx) => {
        if (targetType === "StayArea") await tx.stayArea.update({ where: { label: targetId! }, data: { active: false } });
        if (targetType === "StayAmenity") await tx.stayAmenity.update({ where: { label: targetId! }, data: { active: false } });
        if (targetType === "StayTypeSetting") await tx.stayTypeSetting.update({ where: { id: targetId! }, data: { active: false } });
      });
      return;
    }
    throw new Error(`Chưa hỗ trợ "ẩn" cho loại đối tượng: ${targetType}`);
  }

  if (action === "DELETE") {
    if (targetType === "Food") {
      await prisma.food.delete({ where: { id: targetId! } });
      return;
    }
    if (targetType === "Sale") {
      await prisma.sale.delete({ where: { id: targetId! } });
      return;
    }
    if (targetType === "AmThucBannerSettings" || targetType === "LocalSpecialty" || targetType === "FoodCategory") {
      if (targetType === "LocalSpecialty") await prisma.localSpecialty.delete({ where: { id: targetId! } });
      if (targetType === "FoodCategory") await prisma.foodCategory.delete({ where: { id: targetId! } });
      return;
    }
    throw new Error(`Chưa hỗ trợ "xóa" cho loại đối tượng: ${targetType}`);
  }

  if (action === "UPDATE") {
    if (targetType === "LuuTruPageSettings") {
      await prisma.luuTruPageSettings.update({ where: { id: targetId! }, data: payload as object });
      return;
    }
    throw new Error(`Chưa hỗ trợ "sửa" cho loại đối tượng: ${targetType}`);
  }
}
