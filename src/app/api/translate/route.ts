import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp } from "@/lib/request-log";
import { rateLimit } from "@/lib/rate-limit";
import { translateBatch } from "@/lib/translate-server";

const schema = z.object({ texts: z.array(z.string().max(700)).min(1).max(60) });

// POST /api/translate { texts } -> { translations: { [chuoi goc da chuan hoa]: ban dich } }
// Dich giao dien Viet -> Anh; ban dich duoc luu chung nen khach sau khong ton them luot goi AI.
export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`translate:min:${ip}`, 30, 60_000) || !rateLimit(`translate:hour:${ip}`, 400, 3_600_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const translations = await translateBatch(parsed.data.texts);
  return NextResponse.json({ translations });
}
