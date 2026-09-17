import { NextRequest, NextResponse } from "next/server";
import { searchSite, searchFoodByAiIntent } from "@/lib/search";
import { askAI } from "@/lib/ai-assistant";
import { getClientIp } from "@/lib/request-log";
import { rateLimit } from "@/lib/rate-limit";

const BUSY_MESSAGE = "Bạn đang tìm kiếm hơi nhanh, vui lòng thử lại sau ít phút nhé.";

// Tim kiem 3 lop: (1) tim chu truc tiep (contains) trong du lieu that (Place/Food/News/
// ForumPost); (2) neu khong khop chu nao, thu lop "AI hieu y" - gui danh sach mon an
// THAT cho Gemini de no chon dung mon phu hop voi cau hoi tu nhien cua khach (vd "mon
// toi nhat dinh phai an la gi"), roi tra ve DUNG anh/mo ta/link that tu DB (khong bao
// gio de AI tu bia thong tin); (3) neu ca 2 lop tren deu khong ra gi, moi fallback sang
// AI tro chuyen chung chung (khong biet du lieu that, chi tu van kien thuc chung).
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json({ mode: "empty", results: [] });
  }

  const results = await searchSite(q);
  if (results.length > 0) {
    return NextResponse.json({ mode: "results", results });
  }

  // Tu day tro di moi can Gemini (co the ton quota/chi phi that khi co API key) - rate
  // limit chung cho ca lop "AI hieu y" lan lop "AI tro chuyen chung chung" ben duoi.
  const ip = getClientIp(Object.fromEntries(req.headers.entries()));
  if (!rateLimit(`ai-search:${ip}`, 10, 60_000)) {
    return NextResponse.json({ mode: "ai", answer: BUSY_MESSAGE });
  }

  const aiResults = await searchFoodByAiIntent(q);
  if (aiResults.length > 0) {
    return NextResponse.json({ mode: "results", results: aiResults });
  }

  const answer = await askAI(q);
  return NextResponse.json({ mode: "ai", answer });
}
