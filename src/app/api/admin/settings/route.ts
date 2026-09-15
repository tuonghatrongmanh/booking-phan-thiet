import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { getSiteSettings, updateSiteSettings } from "@/lib/settings";
import { imagePathSchema } from "@/lib/validation";

const settingsSchema = z.object({
  logoUrl: imagePathSchema.optional().or(z.literal("")),
  faviconUrl: imagePathSchema.optional().or(z.literal("")),
  footerDescription: z.string().max(500).optional().or(z.literal("")),
  homeSeoTitle: z.string().max(70).optional().or(z.literal("")),
  homeSeoDescription: z.string().max(160).optional().or(z.literal("")),
});

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "settings", "edit");
  if (permError) return permError;

  const body = await req.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Chuoi rong nghia la "xoa de quay lai mac dinh" - luu null thay vi "" de
  // getSiteSettings() fallback dung logic (|| DEFAULT) hoat dong nhu mong doi.
  const data = Object.fromEntries(
    Object.entries(parsed.data).map(([key, value]) => [key, value === "" ? null : value])
  );

  const updated = await updateSiteSettings(data);
  return NextResponse.json(updated);
}
