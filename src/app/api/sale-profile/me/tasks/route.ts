import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { sendTelegramAlert } from "@/lib/telegram-alert";

const createSchema = z.object({ message: z.string().trim().max(500).optional() });

async function myPlace(userId: string) {
  return prisma.place.findFirst({ where: { userId, category: "SALE" }, select: { id: true, name: true } });
}

// GET - nhiệm vụ của chính Sale này
export async function GET() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  const place = await myPlace(actor.id);
  if (!place) return NextResponse.json({ error: "Bạn chưa có hồ sơ Sale uy tín" }, { status: 404 });
  const tasks = await prisma.saleTask.findMany({ where: { placeId: place.id }, orderBy: { createdAt: "desc" }, take: 30 });
  return NextResponse.json({ tasks });
}

// POST - Sale xin admin giao nhiệm vụ để tăng điểm xếp hạng (chỉ 1 yêu cầu chờ tại một thời điểm)
export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  if (!rateLimit(`sale-task-request:${actor.id}`, 5, 60_000)) return NextResponse.json({ error: "Vui lòng thử lại sau" }, { status: 429 });

  const place = await myPlace(actor.id);
  if (!place) return NextResponse.json({ error: "Bạn chưa có hồ sơ Sale uy tín" }, { status: 404 });

  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Lời nhắn tối đa 500 ký tự" }, { status: 400 });

  const open = await prisma.saleTask.count({ where: { placeId: place.id, status: "REQUESTED" } });
  if (open > 0) return NextResponse.json({ error: "Bạn đã có một yêu cầu đang chờ admin giao việc" }, { status: 400 });

  const task = await prisma.saleTask.create({ data: { placeId: place.id, status: "REQUESTED", saleNote: parsed.data.message || null } });
  void sendTelegramAlert(`🎯 <b>Sale xin nhiệm vụ</b>: ${place.name.replace(/</g, "&lt;")}${parsed.data.message ? `\nLời nhắn: ${parsed.data.message.replace(/</g, "&lt;")}` : ""}\nGiao việc tại Admin → Nhiệm vụ Sale.`);
  return NextResponse.json({ task }, { status: 201 });
}
