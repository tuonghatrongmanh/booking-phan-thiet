import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { AI_GEMINI_MODEL } from "@/lib/ai-assistant";
import { normalizeText, needsTranslation } from "@/lib/translate-utils";

const PROMPT = `You are the professional translator for "Booking Phan Thiết", a Vietnamese travel website (homestays, car rental, food, attractions in Phan Thiết - Mũi Né, Vietnam).
Translate each Vietnamese UI/content string in the JSON array to natural, concise English for international tourists.
Rules:
- Return ONLY a JSON array of strings with EXACTLY the same length and order.
- Keep brand names (Booking Phan Thiết, BookingPhanThiet.com, Zalo, TikTok, Facebook), people's names, place names (Phan Thiết, Mũi Né, ...) and dish names in Vietnamese, adding a short English gloss only for dishes when helpful, e.g. "Bánh hỏi lòng heo (steamed rice vermicelli with pork offal)".
- Keep numbers, prices (e.g. 450.000đ), dates, codes, emojis and punctuation unchanged.
- Keep button/menu labels short. Do not add explanations.`;

const hashOf = (s: string) => createHash("sha256").update(`en:${s}`).digest("hex");

async function callGemini(texts: string[]): Promise<string[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PROMPT }] },
        contents: [{ role: "user", parts: [{ text: JSON.stringify(texts) }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: "application/json",
          responseSchema: { type: "ARRAY", items: { type: "STRING" } },
        },
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      console.error("[translate] Gemini lỗi", res.status);
      return null;
    }
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr) || arr.length !== texts.length || arr.some((x) => typeof x !== "string")) return null;
    return arr as string[];
  } catch (err) {
    console.error("[translate] Lỗi:", err);
    return null;
  }
}

// Dịch lô chuỗi (Việt -> Anh): lấy bản đã có trong DB, chỉ gửi Gemini phần còn thiếu rồi lưu lại.
// Trả về map chuỗi-gốc-đã-chuẩn-hóa -> bản dịch; chuỗi nào lỗi thì không có trong map (client thử lại sau).
export async function translateBatch(input: string[]): Promise<Record<string, string>> {
  const uniq = [...new Set(input.map(normalizeText).filter(needsTranslation))];
  const result: Record<string, string> = {};
  if (uniq.length === 0) return result;

  const rows = await prisma.translationCache.findMany({ where: { hash: { in: uniq.map(hashOf) } }, select: { source: true, target: true } });
  for (const r of rows) result[r.source] = r.target;

  const missing = uniq.filter((s) => !(s in result));
  if (missing.length === 0) return result;

  const translated = await callGemini(missing);
  if (!translated) return result;

  const fresh = missing.map((source, i) => ({ hash: hashOf(source), lang: "en", source, target: translated[i].trim() || source }));
  await prisma.translationCache.createMany({ data: fresh, skipDuplicates: true }).catch((err) => console.error("[translate] lưu cache lỗi:", err));
  for (const f of fresh) result[f.source] = f.target;
  return result;
}
