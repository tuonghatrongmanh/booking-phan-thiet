import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { rateLimit } from "@/lib/rate-limit";
import { fetchTiktokOembed } from "@/lib/tiktok-oembed";
import { z } from "zod";
import { recalcSalePoints } from "@/lib/sale-points-server";
import { parseTiktokInput } from "@/lib/tiktok-embed";

const MAX_VIDEOS = 6;

// Nhận link video TikTok HOẶC cả đoạn mã nhúng; rút ra link chuẩn, chỉ chấp nhận tiktok.com
const createSchema = z.object({
  sourceUrl: z
    .string()
    .trim()
    .min(10, "Hãy dán link video hoặc mã nhúng TikTok")
    .max(4000)
    .transform((v, ctx) => {
      const ref = parseTiktokInput(v);
      if (!ref) ctx.addIssue({ code: "custom", message: "Không đọc được link/mã nhúng TikTok (chỉ nhận tiktok.com)" });
      return ref?.url ?? "";
    }),
});

export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }
  if (!rateLimit(`sale-profile-video:${actor.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Vui lòng thử lại sau" }, { status: 429 });
  }

  const place = await prisma.place.findUnique({ where: { userId: actor.id } });
  if (!place) return NextResponse.json({ error: "Bạn chưa có hồ sơ Sale uy tín" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });

  const count = await prisma.placeVideo.count({ where: { placeId: place.id } });
  if (count >= MAX_VIDEOS) {
    return NextResponse.json(
      { error: `Đã đủ ${MAX_VIDEOS} video, hãy xoá 1 video trước khi thêm mới` },
      { status: 400 }
    );
  }

  const { title, thumbnailUrl } = await fetchTiktokOembed(parsed.data.sourceUrl);

  const video = await prisma.placeVideo.create({
    data: {
      placeId: place.id,
      sourceUrl: parsed.data.sourceUrl,
      title,
      thumbnailUrl,
      sortOrder: count,
    },
  });
  void recalcSalePoints(place.id).catch(() => {});
  return NextResponse.json(video, { status: 201 });
}
