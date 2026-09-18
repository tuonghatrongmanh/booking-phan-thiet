import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { recalcSalePoints } from "@/lib/sale-points-server";

type Params = { params: Promise<{ kind: string; id: string }> };

// DELETE /api/admin/user-reviews/:kind/:id - xóa đánh giá spam/bão đánh giá xấu của
// thành viên ("food" = Ẩm thực, "place" = Lưu trú/Điểm tham quan). Gộp chung quyền với
// "Kiểm duyệt bình luận" vì cùng là kiểm duyệt nội dung do người dùng tạo.
export async function DELETE(_req: Request, { params }: Params) {
  const { admin, error } = await requireSectionAccess("forum-comments");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "forum-comments", "edit");
  if (permError) return permError;

  const { kind, id } = await params;

  if (kind === "food") {
    const review = await prisma.foodReview.findUnique({ where: { id }, include: { user: { select: { name: true } } } });
    if (!review) return NextResponse.json({ error: "Không tìm thấy đánh giá" }, { status: 404 });
    await prisma.foodReview.delete({ where: { id } });
    void logAdminAction(admin, "delete-user-review", "FoodReview", id, `${review.user.name} - ${review.rating}★`);
    return NextResponse.json({ ok: true });
  }

  if (kind === "place") {
    const review = await prisma.placeReview.findUnique({ where: { id }, include: { user: { select: { name: true } } } });
    if (!review) return NextResponse.json({ error: "Không tìm thấy đánh giá" }, { status: 404 });
    await prisma.placeReview.delete({ where: { id } });
    void recalcSalePoints(review.placeId).catch(() => {});
    void logAdminAction(admin, "delete-user-review", "PlaceReview", id, `${review.user.name} - ${review.rating}★`);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Loại đánh giá không hợp lệ" }, { status: 400 });
}
