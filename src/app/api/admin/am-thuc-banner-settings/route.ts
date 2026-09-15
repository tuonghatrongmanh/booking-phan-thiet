import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { getAmThucBannerSettings, updateAmThucBannerSettings } from "@/lib/am-thuc-banner-settings";
import { imagePathSchema } from "@/lib/validation";

const settingsSchema = z.object({
  heroBanner: imagePathSchema.optional().or(z.literal("")),
  badgeIcon: z.string().max(80).optional().or(z.literal("")),
  badgeText: z.string().max(80).optional().or(z.literal("")),
  headingTop: z.string().max(120).optional().or(z.literal("")),
  headingBottom: z.string().max(120).optional().or(z.literal("")),
  subheading: z.string().max(300).optional().or(z.literal("")),

  promoImage: imagePathSchema.optional().or(z.literal("")),
  promoTitle: z.string().max(120).optional().or(z.literal("")),
  promoPrice: z.string().max(80).optional().or(z.literal("")),
  promoFeature1: z.string().max(80).optional().or(z.literal("")),
  promoFeature2: z.string().max(80).optional().or(z.literal("")),
  promoFeature3: z.string().max(80).optional().or(z.literal("")),
  promoButtonText: z.string().max(60).optional().or(z.literal("")),

  trustIcon1: z.string().max(80).optional().or(z.literal("")),
  trustTitle1: z.string().max(80).optional().or(z.literal("")),
  trustDesc1: z.string().max(120).optional().or(z.literal("")),
  trustIcon2: z.string().max(80).optional().or(z.literal("")),
  trustTitle2: z.string().max(80).optional().or(z.literal("")),
  trustDesc2: z.string().max(120).optional().or(z.literal("")),
  trustIcon3: z.string().max(80).optional().or(z.literal("")),
  trustTitle3: z.string().max(80).optional().or(z.literal("")),
  trustDesc3: z.string().max(120).optional().or(z.literal("")),

  verifiedStampImage: imagePathSchema.optional().or(z.literal("")),
  crossPromoImage: imagePathSchema.optional().or(z.literal("")),
  crossPromoTitle: z.string().max(120).optional().or(z.literal("")),
  crossPromoButtonText: z.string().max(60).optional().or(z.literal("")),
});

export async function GET() {
  const settings = await getAmThucBannerSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;

  const permError = requireCreateOrEdit(admin, "am-thuc-banner", "edit");
  if (permError) return permError;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, value === "" ? null : value])
  );

  const updated = await updateAmThucBannerSettings(data);
  return NextResponse.json(updated);
}
