import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import type { SectionKey } from "@/lib/admin-permissions";
import { z } from "zod";
import { PlaceCategory, PlaceStatus, StayType } from "@prisma/client";
import { imagePathSchema } from "@/lib/validation";
import { pingIndexNow, placePublicUrl } from "@/lib/indexnow";

const placeSchema = z.object({
  name: z.string().min(2),
  category: z.nativeEnum(PlaceCategory),
  status: z.nativeEnum(PlaceStatus).optional().default("TRUSTED"),
  avatar: imagePathSchema.optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  fanpageUrl: z.string().url().optional(),
  zaloUrl: z.string().url().optional(),
  description: z.string().optional(),
  stayType: z.nativeEnum(StayType).nullable().optional(),
  priceFromVnd: z.number().int().nonnegative().nullable().optional(),
  distanceToBeachM: z.number().int().nonnegative().nullable().optional(),
  openingHours: z.string().nullable().optional(),
  distanceFromCenterKm: z.number().nonnegative().nullable().optional(),
  amenities: z.array(z.string()).optional(),
  petFriendly: z.boolean().optional(),
  totalRooms: z.number().int().nonnegative().nullable().optional(),
  depositVnd: z.number().int().min(10_000).max(50_000_000).nullable().optional(),
  availableRooms: z.number().int().nonnegative().nullable().optional(),
  mapEmbedUrl: z.string().nullable().optional(),
  videoUrl: z.string().trim().regex(/^[A-Za-z0-9_-]{6,20}$/, "Video ID không hợp lệ").nullable().optional().or(z.literal("")),
  videoCaption: z.string().trim().nullable().optional(),
  vehicleType: z.string().trim().nullable().optional(),
  priceHolidayVnd: z.number().int().nonnegative().nullable().optional(),
  returnLocation: z.string().trim().nullable().optional(),
  brand: z.string().trim().nullable().optional(),
  engineCc: z.number().int().nonnegative().nullable().optional(),
  transmission: z.string().trim().nullable().optional(),
  seats: z.number().int().positive().nullable().optional(),
  badge: z.string().trim().nullable().optional(),
  coverImage: imagePathSchema.nullable().optional(),
  roleTitle: z.string().trim().max(150).nullable().optional(),
  slogan: z.string().trim().max(300).nullable().optional(),
  workArea: z.string().trim().max(150).nullable().optional(),
  yearsExperience: z.number().int().min(0).max(80).nullable().optional(),
  clientsServedCount: z.number().int().min(0).nullable().optional(),
  tiktokUrl: z.string().trim().url().nullable().optional(),
  youtubeUrl: z.string().trim().url().nullable().optional(),
  instagramUrl: z.string().trim().url().nullable().optional(),
});

// GET /api/places?category=HOMESTAY&status=TRUSTED&q=ten
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") as PlaceCategory | null;
  const status = searchParams.get("status") as PlaceStatus | null;
  const stayType = searchParams.get("stayType") as StayType | null;
  const q = searchParams.get("q");

  const places = await prisma.place.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(status ? { status } : {}),
      ...(stayType ? { stayType } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      images: true,
      _count: { select: { reviews: true, socialComments: true } },
    },
  });

  return NextResponse.json(places);
}

const CATEGORY_SECTION: Partial<Record<PlaceCategory, SectionKey>> = {
  HOMESTAY: "homestay",
  ATTRACTION: "attractions",
  CAR_RENTAL: "car-rentals",
};

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const body = await req.json();
  const parsed = placeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const section = CATEGORY_SECTION[parsed.data.category];
  if (section) {
    const permError = requireCreateOrEdit(admin, section, "create");
    if (permError) return permError;
  } else if (admin.role !== "SUPER_ADMIN") {
    // Category khong co trong bang (RESTAURANT, SALE) - khong cap quyen cho staff.
    return NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
  }

  const place = await prisma.place.create({ data: parsed.data });

  pingIndexNow([placePublicUrl(place)]);

  return NextResponse.json(place, { status: 201 });
}
