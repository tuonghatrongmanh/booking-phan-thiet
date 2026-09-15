import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { getGameBannerSettings, updateGameBannerSettings } from "@/lib/game-banner-settings";
import { imagePathSchema } from "@/lib/validation";

const settingsSchema = z.object({
  heroBanner: imagePathSchema.optional().or(z.literal("")),
  rewardBanner: imagePathSchema.optional().or(z.literal("")),
});

export async function GET() {
  const settings = await getGameBannerSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "game-banners", "edit");
  if (permError) return permError;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Chuoi rong nghia la "xoa de quay lai mac dinh" - luu null thay vi "" de
  // getGameBannerSettings() fallback dung logic hoat dong nhu mong doi.
  const data = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, value === "" ? null : value])
  );

  const updated = await updateGameBannerSettings(data);
  return NextResponse.json(updated);
}
