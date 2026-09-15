import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import { getLuuTruPageSettings, updateLuuTruPageSettings } from "@/lib/luu-tru-settings";

const settingsSchema = z.object({
  mapEmbedUrl: z.string().trim().optional().or(z.literal("")),
  promoTitle: z.string().max(60).optional().or(z.literal("")),
  promoSubtitle: z.string().max(100).optional().or(z.literal("")),
  promoButtonText: z.string().max(60).optional().or(z.literal("")),
  verifiedStampImage: z.string().trim().optional().or(z.literal("")),
  crossPromoImage: z.string().trim().optional().or(z.literal("")),
  crossPromoTitle: z.string().max(120).optional().or(z.literal("")),
  crossPromoButtonText: z.string().max(60).optional().or(z.literal("")),
});

export async function GET() {
  const settings = await getLuuTruPageSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, value === "" ? null : value])
  );

  const updated = await updateLuuTruPageSettings(data);
  return NextResponse.json(updated);
}
