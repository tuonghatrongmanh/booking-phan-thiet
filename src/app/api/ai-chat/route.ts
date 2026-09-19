import { NextRequest, NextResponse } from "next/server";
import { searchSite, searchFoodByAiIntent, type SearchResultItem } from "@/lib/search";
import { chatWithAI } from "@/lib/ai-chat";
import { chatRequestSchema } from "@/lib/ai-chat-schema";
import { extractSearchPhrases, extractWebQuery, FOOD_INTENT_RE, sanitizeTurns, SMALL_TALK_RE } from "@/lib/ai-chat-utils";
import { lookupWeb, WEATHER_RE, type WebContext } from "@/lib/web-lookup";
import { getClientIp } from "@/lib/request-log";
import { rateLimit } from "@/lib/rate-limit";

const BUSY = "Bạn hỏi hơi nhanh, chờ mình một chút rồi hỏi tiếp nhé.";

// Tim du lieu THAT cua trang cho cau hoi cuoi cua khach: khop nguyen cau, roi khop theo cum
// tu khoa da bo tu hoi/dem, cuoi cung (neu hoi ve an uong) nho AI "hieu y" chon mon that.
// Ket qua vua hien thanh the cho khach, vua dua vao prompt de AI khong bia ten/gia.
async function findSiteCards(question: string): Promise<SearchResultItem[]> {
  const queries = [question, ...extractSearchPhrases(question)];
  const batches = await Promise.all(queries.map((q) => searchSite(q).catch(() => [])));
  const seen = new Set<string>();
  const cards: SearchResultItem[] = [];
  for (const item of batches.flat()) {
    const key = `${item.type}:${item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    cards.push(item);
  }
  if (cards.length === 0 && FOOD_INTENT_RE.test(question)) {
    return searchFoodByAiIntent(question).catch(() => []);
  }
  return cards.slice(0, 5);
}

// Chi tra cuu internet khi cau hoi la thoi tiet, HOAC trang khong co du lieu nao khop (cau hoi
// ngoai pham vi) va khong phai loi chao/cam on - tiet kiem quota va do tre cho cau hoi thuong.
function needsWebLookup(question: string, cards: SearchResultItem[]): boolean {
  if (WEATHER_RE.test(question)) return true;
  return cards.length === 0 && question.length >= 8 && !SMALL_TALK_RE.test(question);
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`ai-chat:min:${ip}`, 10, 60_000) || !rateLimit(`ai-chat:hour:${ip}`, 80, 3_600_000)) {
    return NextResponse.json({ answer: BUSY, sources: [], searchQueries: [], cards: [] }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const turns = sanitizeTurns(parsed.data.messages);
  const question = turns[turns.length - 1]?.text;
  if (!question) return NextResponse.json({ error: "Bạn chưa nhập câu hỏi" }, { status: 400 });

  const cards = await findSiteCards(question);
  const web: WebContext | null = needsWebLookup(question, cards) ? await lookupWeb(question, extractWebQuery(question)) : null;
  const result = await chatWithAI(turns, cards, web);

  return NextResponse.json({
    answer: result.answer,
    sources: result.sources,
    searchQueries: result.searchQueries,
    cards,
  });
}
