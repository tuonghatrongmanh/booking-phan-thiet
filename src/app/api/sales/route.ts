import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit, requestDeleteOrHide } from "@/lib/admin-action";
import { z } from "zod";
import { PlaceCategory } from "@prisma/client";
import { imagePathSchema } from "@/lib/validation";
import { saveTranslations } from "@/lib/content-translation";

const saleSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(3),
  image: imagePathSchema,
  discountPercent: z.number().int().min(0).max(100).optional(),
  placeName: z.string().min(1),
  phone: z.string().optional(),
  category: z.nativeEnum(PlaceCategory).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  active: z.boolean().optional().default(true),
});

// GET /api/sales?active=true&category=HOMESTAY
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeParam = searchParams.get("active");
  const category = searchParams.get("category") as PlaceCategory | null;

  const where = {
    ...(activeParam !== null ? { active: activeParam === "true" } : {}),
    ...(category ? { category } : {}),
  };

  const sales = await prisma.sale.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sales);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "sales", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = saleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { startDate, endDate, ...rest } = parsed.data;
  const sale = await prisma.sale.create({
    data: {
      ...rest,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    },
  });

  void saveTranslations("Sale", sale.id, { title: sale.title });

  return NextResponse.json(sale, { status: 201 });
}
