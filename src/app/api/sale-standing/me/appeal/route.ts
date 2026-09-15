import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const schema = z.object({ appealText: z.string().trim().min(10, "Vui lòng trình bày chi tiết hơn (ít nhất 10 ký tự)").max(2000) });

// POST /api/sale-standing/me/appeal - Sale gui khieu nai ve ly do bi dinh chi/cam.
export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }
  if (!rateLimit(`sale-appeal:${actor.id}`, 3, 60_000)) {
    return NextResponse.json({ error: "Vui lòng thử lại sau" }, { status: 429 });
  }

  const place = await prisma.place.findUnique({ where: { userId: actor.id } });
  if (!place) return NextResponse.json({ error: "Không tìm thấy hồ sơ Sale" }, { status: 404 });

  const standing = await prisma.saleStanding.findUnique({ where: { placeId: place.id } });
  if (!standing || !standing.active) {
    return NextResponse.json({ error: "Không có tình trạng đình chỉ/cấm để khiếu nại" }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updated = await prisma.saleStanding.update({
    where: { placeId: place.id },
    data: {
      appealText: parsed.data.appealText,
      appealCreatedAt: new Date(),
      appealStatus: "PENDING",
      appealNote: null,
      appealResolvedAt: null,
    },
  });

  return NextResponse.json(updated);
}
