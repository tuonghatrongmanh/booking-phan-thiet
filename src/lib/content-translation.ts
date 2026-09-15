import { prisma } from "@/lib/prisma";
import { translateText } from "@/lib/translate";
import { LOCALES } from "@/lib/i18n/translations";

const TARGET_LOCALES = LOCALES.filter((l) => l !== "vi");

// Dich 1 lan luc admin luu bai (khong phai luc khach xem trang) va luu ket qua vao
// bang Translation - goi ham nay KHONG await o noi goi (fire-and-forget) de khong lam
// cham phan hoi luu bai; loi dich (neu co, vd Google tam thoi chan) chi log ra console,
// khong lam hong viec luu bai goc bang tieng Viet.
export async function saveTranslations(model: string, recordId: string, fields: Record<string, string | null | undefined>) {
  const entries = Object.entries(fields).filter(([, v]) => v && v.trim().length > 0) as [string, string][];
  if (entries.length === 0) return;

  const jobs = TARGET_LOCALES.flatMap((locale) =>
    entries.map(async ([field, text]) => {
      try {
        const translated = await translateText(text, locale);
        await prisma.translation.upsert({
          where: { model_recordId_field_locale: { model, recordId, field, locale } },
          update: { text: translated },
          create: { model, recordId, field, locale, text: translated },
        });
      } catch (err) {
        console.error(`[translate] Lỗi dịch ${model}#${recordId}.${field} -> ${locale}:`, err);
      }
    })
  );

  await Promise.all(jobs);
}

export async function getTranslations(model: string, recordId: string, locale: string): Promise<Record<string, string>> {
  if (locale === "vi") return {};
  const rows = await prisma.translation.findMany({ where: { model, recordId, locale } });
  return Object.fromEntries(rows.map((r) => [r.field, r.text]));
}

export async function getTranslation(model: string, recordId: string, field: string, locale: string): Promise<string | null> {
  if (locale === "vi") return null;
  const row = await prisma.translation.findUnique({
    where: { model_recordId_field_locale: { model, recordId, field, locale } },
  });
  return row?.text ?? null;
}
