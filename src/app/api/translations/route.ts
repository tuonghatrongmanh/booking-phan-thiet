import { NextRequest, NextResponse } from "next/server";
import { getTranslations } from "@/lib/content-translation";

// GET /api/translations?model=News&recordId=xxx&locale=en
// Tra ve toan bo cac truong da dich san cho 1 ban ghi - chi doc tu DB (khong goi
// Google Translate o day), nen luon nhanh du khach xem trang nao cung vay.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const model = searchParams.get("model");
  const recordId = searchParams.get("recordId");
  const locale = searchParams.get("locale");

  if (!model || !recordId || !locale) {
    return NextResponse.json({ error: "Thiếu tham số model/recordId/locale" }, { status: 400 });
  }

  const fields = await getTranslations(model, recordId, locale);
  return NextResponse.json({ fields });
}
