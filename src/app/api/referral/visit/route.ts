import { NextRequest, NextResponse } from "next/server";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { recordReferralVisit } from "@/lib/referral";

// POST /api/referral/visit { code } - trình duyệt của khách báo "vừa vào bằng link giới thiệu" (RefCapture, tối đa 1 lần/ngày/mã).
// Công khai nhưng: giới hạn theo IP, chỉ nhận mã có thật, không đếm chính chủ tự bấm, luôn trả 204 (không lộ mã nào đúng).
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!rateLimit(`ref-visit:${ip}`, 40, 60 * 60_000)) return new NextResponse(null, { status: 204 });

  const body = (await req.json().catch(() => null)) as { code?: unknown } | null;
  if (typeof body?.code !== "string") return new NextResponse(null, { status: 204 });

  const actor = await getActor();
  await recordReferralVisit(body.code, actor?.type === "user" ? actor.id : undefined).catch(() => false);
  return new NextResponse(null, { status: 204 });
}
