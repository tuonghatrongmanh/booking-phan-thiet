import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { canTransition } from "@/lib/sale-tasks";
import { sendTelegramAlert } from "@/lib/telegram-alert";

const schema = z.object({ note: z.string().trim().min(3, "Hãy ghi chú ngắn về việc bạn đã làm (link bài đăng, kết quả...)").max(1000) });

// PATCH - Sale báo đã hoàn thành nhiệm vụ được giao (ASSIGNED -> SUBMITTED)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  if (!rateLimit(`sale-task-submit:${actor.id}`, 10, 60_000)) return NextResponse.json({ error: "Vui lòng thử lại sau" }, { status: 429 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });

  const task = await prisma.saleTask.findUnique({ where: { id }, include: { place: { select: { userId: true, name: true } } } });
  // không lộ việc của người khác: coi như không tồn tại
  if (!task || task.place.userId !== actor.id) return NextResponse.json({ error: "Không tìm thấy nhiệm vụ" }, { status: 404 });
  if (!canTransition(task.status, "SUBMITTED")) return NextResponse.json({ error: "Nhiệm vụ này chưa thể báo hoàn thành" }, { status: 400 });

  const updated = await prisma.saleTask.update({ where: { id }, data: { status: "SUBMITTED", saleNote: parsed.data.note } });
  void sendTelegramAlert(`✅ <b>Sale báo hoàn thành nhiệm vụ</b>: ${task.place.name.replace(/</g, "&lt;")} - ${(task.title ?? "").replace(/</g, "&lt;")}\nDuyệt tại Admin → Nhiệm vụ Sale.`);
  return NextResponse.json({ task: updated });
}
