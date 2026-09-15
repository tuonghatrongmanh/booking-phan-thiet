import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import type { SectionKey } from "@/lib/admin-permissions";
import { z } from "zod";
import { PlaceCategory, PlaceStatus, StayType } from "@prisma/client";
import { imagePathSchema } from "@/lib/validation";
import { saveTranslations } from "@/lib/content-translation";

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.nativeEnum(PlaceCategory).optional(),
  status: z.nativeEnum(PlaceStatus).optional(),
  avatar: imagePathSchema.optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  fanpageUrl: z.string().url().optional(),
  zaloUrl: z.string().url().optional(),
  description: z.string().optional(),
  featuredRank: z.number().int().nullable().optional(),
  stayType: z.nativeEnum(StayType).nullable().optional(),
  priceFromVnd: z.number().int().nonnegative().nullable().optional(),
  distanceToBeachM: z.number().int().nonnegative().nullable().optional(),
  openingHours: z.string().nullable().optional(),
  distanceFromCenterKm: z.number().nonnegative().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  petFriendly: z.boolean().optional(),
  totalRooms: z.number().int().nonnegative().nullable().optional(),
  availableRooms: z.number().int().nonnegative().nullable().optional(),
  mapEmbedUrl: z.string().nullable().optional(),
  videoUrl: z.string().trim().regex(/^[A-Za-z0-9_-]{6,20}$/, "Video ID không hợp lệ").nullable().optional().or(z.literal("")),
  videoCaption: z.string().trim().nullable().optional(),
  vehicleType: z.string().trim().nullable().optional(),
  priceHolidayVnd: z.number().int().nonnegative().nullable().optional(),
  returnLocation: z.string().trim().nullable().optional(),
  coverImage: imagePathSchema.nullable().optional(),
  roleTitle: z.string().trim().max(150).nullable().optional(),
  slogan: z.string().trim().max(300).nullable().optional(),
  workArea: z.string().trim().max(150).nullable().optional(),
  yearsExperience: z.number().int().min(0).max(80).nullable().optional(),
  clientsServedCount: z.number().int().min(0).nullable().optional(),
  tiktokUrl: z.string().trim().url().nullable().optional(),
  youtubeUrl: z.string().trim().url().nullable().optional(),
  instagramUrl: z.string().trim().url().nullable().optional(),
  hidden: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

// Anh xa PlaceCategory -> section quyen tuong ung, dung cho ca PATCH/DELETE ben duoi.
// Category khong co trong bang (RESTAURANT, SALE) coi nhu chua duoc cap quyen (an toan).
const CATEGORY_SECTION: Partial<Record<PlaceCategory, SectionKey>> = {
  HOMESTAY: "homestay",
  ATTRACTION: "attractions",
  CAR_RENTAL: "car-rentals",
};

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      images: true,
      socialComments: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!place) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  return NextResponse.json(place);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.place.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const section = CATEGORY_SECTION[existing.category];

  // Yeu cau chi doi "hidden" (an/hien) - tach rieng vi co the can duyet, khong tron
  // voi cac truong khac trong 1 request.
  if (parsed.data.hidden !== undefined && Object.keys(parsed.data).length === 1) {
    if (!parsed.data.hidden) {
      // Bo an: luon lam truc tiep (khong ai can "duyet" viec HIEN lai ca), tru khi
      // khong co quyen edit muc nay.
      const permError = section
        ? requireCreateOrEdit(admin, section, "edit")
        : admin.role !== "SUPER_ADMIN"
          ? NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 })
          : null;
      if (permError) return permError;
      const place = await prisma.place.update({ where: { id }, data: { hidden: false } });
      return NextResponse.json(place);
    }

    if (!section) return NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
    const result = await requestDeleteOrHide({
      admin,
      section,
      action: "hide",
      targetType: "Place",
      targetId: id,
      targetLabel: existing.name,
    });
    if (result.outcome !== "direct") return result.response;

    const place = await prisma.place.update({ where: { id }, data: { hidden: true } });
    return NextResponse.json(place);
  }

  if (section) {
    const permError = requireCreateOrEdit(admin, section, "edit");
    if (permError) return permError;
  } else if (admin.role !== "SUPER_ADMIN") {
    // Category khong co trong bang (RESTAURANT, SALE) - khong cap quyen cho staff.
    return NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
  }

  try {
    const place = await prisma.place.update({ where: { id }, data: parsed.data });
    if (parsed.data.name || parsed.data.description) {
      void saveTranslations("Place", place.id, { name: place.name, description: place.description });
    }
    return NextResponse.json(place);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const { id } = await params;
  const existing = await prisma.place.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });

  const section = CATEGORY_SECTION[existing.category];
  if (!section) return NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });

  const result = await requestDeleteOrHide({
    admin,
    section,
    action: "delete",
    targetType: "Place",
    targetId: id,
    targetLabel: existing.name,
  });
  if (result.outcome !== "direct") return result.response;

  await prisma.place.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
