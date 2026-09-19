import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { recalcSalePoints } from "@/lib/sale-points-server";
import { canTransition, MAX_BONUS_POINTS, type SaleTaskStatus } from "@/lib/sale-tasks";

const schema = z.object({
  action: z.enum(["assign", "return", "approve", "reject"]),
  title: z.string().trim().min(3).max(120).optional(),
  description: z.string().trim().max(2000).optional(),
  bonusPoints: z.number().int().min(0).max(MAX_BONUS_POINTS).optional(),
  adminNote: z.string().trim().max(1000).optional(),
});

const TARGET: Record<"assign" | "return" | "approve" | "reject", SaleTaskStatus> = { assign: "ASSIGNED", return: "ASSIGNED", approve: "DONE", reject: "REJECTED" };

// PATCH - admin giao việc (kèm tên/mô tả/điểm), trả lại làm lại, duyệt hoàn thành (cộng điểm) hoặc từ chối
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireSectionAccess("sale-agents");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "sale-agents", "edit");
  if (permError) return permError;

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  const { action } = parsed.data;

  const task = await prisma.saleTask.findUnique({ where: { id }, include: { place: { select: { name: true } } } });
  if (!task) return NextResponse.json({ error: "Không tìm thấy nhiệm vụ" }, { status: 404 });
  const to = TARGET[action];
  if (!canTransition(task.status, to)) return NextResponse.json({ error: "Không thể chuyển nhiệm vụ sang trạng thái này" }, { status: 400 });

  if (action === "assign" && !(parsed.data.title ?? task.title)) {
    return NextResponse.json({ error: "Hãy nhập tên nhiệm vụ trước khi giao" }, { status: 400 });
  }

  const updated = await prisma.saleTask.update({
    where: { id },
    data: {
      status: to,
      ...(parsed.data.title ? { title: parsed.data.title } : {}),
      ...(parsed.data.description !== undefined ? { description: parsed.data.description || null } : {}),
      ...(parsed.data.bonusPoints !== undefined ? { bonusPoints: parsed.data.bonusPoints } : {}),
      ...(parsed.data.adminNote !== undefined ? { adminNote: parsed.data.adminNote || null } : {}),
    },
  });
  void logAdminAction(admin, `task-${action}`, "SaleTask", id, `${task.place.name}: ${updated.title ?? "(chưa đặt tên)"} (+${updated.bonusPoints})`);
  if (to === "DONE") void recalcSalePoints(task.placeId).catch(() => {});
  return NextResponse.json({ task: updated });
}
