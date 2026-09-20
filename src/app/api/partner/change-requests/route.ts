import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { partnerChangeSchema } from "@/lib/partner";

const bodySchema = z.object({ placeId: z.string().min(1), payload: z.unknown() });

// POST /api/partner/change-requests { placeId, payload } - đối tác gửi yêu cầu sửa giá/mô tả/ảnh cho chỗ CỦA MÌNH.
// Không áp dụng ngay: chờ SuperAdmin duyệt ở /admin/yeu-cau-doi-tac.
export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  if (!rateLimit(`partner-change:${actor.id}`, 10, 60 * 60_000)) return NextResponse.json({ error: "Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau" }, { status: 429 });

  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const place = await prisma.place.findUnique({ where: { id: body.data.placeId }, select: { id: true, category: true, partnerUserId: true } });
  // Không phải chủ của chỗ này: trả 404 (không tiết lộ chỗ đó có tồn tại)
  if (!place || place.partnerUserId !== actor.id) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const parsed = partnerChangeSchema.safeParse(body.data.payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  if (place.category !== "CAR_RENTAL" && parsed.data.priceHolidayVnd !== undefined) {
    return NextResponse.json({ error: "Giá ngày lễ chỉ áp dụng cho xe thuê" }, { status: 400 });
  }

  const pending = await prisma.placeChangeRequest.count({ where: { placeId: place.id, status: "PENDING" } });
  if (pending > 0) return NextResponse.json({ error: "Bạn đang có một yêu cầu chờ duyệt cho chỗ này. Hãy đợi admin xử lý xong rồi gửi tiếp." }, { status: 409 });

  const created = await prisma.placeChangeRequest.create({ data: { placeId: place.id, userId: actor.id, payload: parsed.data } });
  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}
