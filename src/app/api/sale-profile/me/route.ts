import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { z } from "zod";
import { imagePathSchema } from "@/lib/validation";

// Ho so Sale uy tin (Place category SALE) cua chinh nguoi dung dang dang nhap - tim
// qua Place.userId (khong can id trong URL, luon la "cua toi"). 404 neu chua duoc
// admin duyet don + tao ho so (xem sale-applications/[id]/route.ts).
async function getOwnPlace(userId: string) {
  return prisma.place.findUnique({ where: { userId } });
}

export async function GET() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const place = await getOwnPlace(actor.id);
  if (!place) return NextResponse.json({ error: "Bạn chưa có hồ sơ Sale uy tín" }, { status: 404 });

  const [videos, testimonials] = await Promise.all([
    prisma.placeVideo.findMany({ where: { placeId: place.id }, orderBy: { sortOrder: "asc" } }),
    prisma.socialComment.findMany({ where: { placeId: place.id }, orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({ ...place, videos, testimonials });
}

const updateSchema = z.object({
  avatar: imagePathSchema.optional(),
  coverImage: imagePathSchema.optional().nullable().or(z.literal("")),
  name: z.string().trim().min(2).optional(),
  roleTitle: z.string().trim().max(150).nullable().optional(),
  slogan: z.string().trim().max(300).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  phone: z.string().trim().max(20).nullable().optional(),
  workArea: z.string().trim().max(150).nullable().optional(),
  yearsExperience: z.number().int().min(0).max(80).nullable().optional(),
  clientsServedCount: z.number().int().min(0).nullable().optional(),
  zaloUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  fanpageUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  tiktokUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  youtubeUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
  instagramUrl: z.string().trim().url().nullable().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const place = await getOwnPlace(actor.id);
  if (!place) return NextResponse.json({ error: "Bạn chưa có hồ sơ Sale uy tín" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, value === "" ? null : value])
  );

  const updated = await prisma.place.update({ where: { id: place.id }, data });
  return NextResponse.json(updated);
}
