import { prisma } from "@/lib/prisma";
import type { PendingChange } from "@prisma/client";
import { getIO } from "@/lib/socket-server";
import { forumCategoryRoom, forumPostRoom } from "@/lib/socket-rooms";
import { enumToSlug } from "@/lib/forum";

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
    const simpleDeletes: Record<string, (id: string) => Promise<unknown>> = {
      ActivitySample: (id) => prisma.activitySample.delete({ where: { id } }),
      CtaBanner: (id) => prisma.ctaBanner.delete({ where: { id } }),
      BrandLogo: (id) => prisma.brandLogo.delete({ where: { id } }),
      Game: (id) => prisma.game.delete({ where: { id } }),
      GuideVideo: (id) => prisma.guideVideo.delete({ where: { id } }),
      HeroTile: (id) => prisma.heroTile.delete({ where: { id } }),
      Popup: (id) => prisma.popup.delete({ where: { id } }),
      Review: (id) => prisma.review.delete({ where: { id } }),
      RewardItem: (id) => prisma.rewardItem.delete({ where: { id } }),
      News: (id) => prisma.news.delete({ where: { id } }),
      Place: (id) => prisma.place.delete({ where: { id } }),
      StayArea: (label) => prisma.stayArea.delete({ where: { label } }),
      StayAmenity: (label) => prisma.stayAmenity.delete({ where: { label } }),
    };
    if (simpleDeletes[targetType]) {
      await simpleDeletes[targetType](targetId!);
      return;
    }
    if (targetType === "ForumComment") {
      const comment = await prisma.forumComment.findUnique({ where: { id: targetId! }, select: { postId: true, post: { select: { category: true } } } });
      await prisma.forumComment.delete({ where: { id: targetId! } });
      if (comment) {
        const commentsCount = await prisma.forumComment.count({ where: { postId: comment.postId } });
        const io = getIO();
        io?.to(forumPostRoom(comment.postId)).emit("comment:deleted", { id: targetId, postId: comment.postId });
        io?.to(forumCategoryRoom(enumToSlug(comment.post.category))).emit("post:stats", { postId: comment.postId, commentsCount });
      }
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
      await prisma.luuTruPageSettings.upsert({
        where: { id: targetId! },
        create: { id: targetId!, ...(payload as object) },
        update: payload as object,
      });
      return;
    }
    throw new Error(`Chưa hỗ trợ "sửa" cho loại đối tượng: ${targetType}`);
  }
}
