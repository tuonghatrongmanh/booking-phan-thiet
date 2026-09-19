import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { getSiteSettings, updateSiteSettings } from "@/lib/settings";
import { imagePathSchema } from "@/lib/validation";

const optUrl = z.string().trim().url("Liên kết không hợp lệ").max(300).optional().or(z.literal(""));
const optText = (max: number) => z.string().trim().max(max).optional().or(z.literal(""));

// Người dùng hay dán cả thẻ <meta ... content="XXXX" /> của Google/Bing - chỉ lấy phần content.
const verificationCode = z
  .string()
  .trim()
  .max(400)
  .optional()
  .or(z.literal(""))
  .transform((v) => {
    if (!v) return v;
    const m = v.match(/content=["']([^"']+)["']/i);
    return (m ? m[1] : v).trim();
  })
  .refine((v) => !v || /^[A-Za-z0-9_-]{10,120}$/.test(v), "Mã xác minh không hợp lệ (chỉ gồm chữ, số, - và _)");

const settingsSchema = z.object({
  googleSiteVerification: verificationCode,
  bingSiteVerification: verificationCode,
  googleAnalyticsId: z
    .string()
    .trim()
    .regex(/^G-[A-Z0-9]{6,14}$/, "GA4 Measurement ID có dạng G-XXXXXXXXXX")
    .optional()
    .or(z.literal("")),
  orgName: optText(120),
  orgPhone: optText(30),
  orgEmail: z.string().trim().email("Email không hợp lệ").max(120).optional().or(z.literal("")),
  orgAddress: optText(250),
  founderName: optText(120),
  founderTitle: optText(120),
  founderBio: optText(2000),
  founderPhoto: imagePathSchema.optional().or(z.literal("")),
  facebookUrl: optUrl,
  tiktokUrl: optUrl,
  youtubeUrl: optUrl,
  instagramUrl: optUrl,
  linkedinUrl: optUrl,
  zaloUrl: optUrl,
  googleBusinessUrl: optUrl,
  sameAsExtra: optText(2000),
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
