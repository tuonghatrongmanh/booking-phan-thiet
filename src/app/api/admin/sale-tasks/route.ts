import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSectionAccess, requireCreateOrEdit } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { MAX_BONUS_POINTS } from "@/lib/sale-tasks";

const createSchema = z.object({
  placeId: z.string().min(5),
  title: z.string().trim().min(3, "Nhập tên nhiệm vụ").max(120),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  bonusPoints: z.number().int().min(0).max(MAX_BONUS_POINTS),
});

// GET /api/admin/sale-tasks - danh sách nhiệm vụ (mới nhất trước)
export async function GET() {
  const { error } = await requireSectionAccess("sale-agents");
  if (error) return error;
  const tasks = await prisma.saleTask.findMany({ orderBy: { updatedAt: "desc" }, take: 100, include: { place: { select: { id: true, name: true, avatar: true, salePoints: true } } } });
  return NextResponse.json({ tasks });
}

// POST - admin chủ động giao nhiệm vụ cho 1 Sale (không cần Sale xin trước)
export async function POST(req: NextRequest) {
  const { admin, error } = await requireSectionAccess("sale-agents");
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "sale-agents", "create");
  if (permError) return permError;

  const parsed = createSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });

  const place = await prisma.place.findFirst({ where: { id: parsed.data.placeId, category: "SALE" }, select: { id: true, name: true } });
  if (!place) return NextResponse.json({ error: "Không tìm thấy Sale" }, { status: 404 });

  const task = await prisma.saleTask.create({
    data: { placeId: place.id, status: "ASSIGNED", title: parsed.data.title, description: parsed.data.description || null, bonusPoints: parsed.data.bonusPoints },
  });
  void logAdminAction(admin, "assign", "SaleTask", task.id, `${place.name}: ${parsed.data.title} (+${parsed.data.bonusPoints})`);
  return NextResponse.json({ task }, { status: 201 });
}
