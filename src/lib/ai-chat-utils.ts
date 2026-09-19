// Ham thuan (khong I/O) cho chat AI: lam sach lich su hoi thoai gui len, va trich nguon
// trich dan tu ket qua "Grounding with Google Search" cua Gemini. Tach rieng de test duoc
// ma khong can goi mang.
export type ChatTurn = { role: "user" | "model"; text: string };

export type ChatSource = { title: string; uri: string };

export const MAX_TURNS = 10;
export const MAX_TEXT = 800;

// Lich su do client gui len la du lieu KHONG TIN CAY: ep vai tro ve user/model, cat do dai,
// bo tin rong, chi giu MAX_TURNS luot gan nhat va dam bao tin cuoi cung la cua khach
// (Gemini yeu cau luot cuoi la user; neu khong thi chat vo nghia).
export function sanitizeTurns(input: unknown): ChatTurn[] {
  if (!Array.isArray(input)) return [];
  const turns: ChatTurn[] = [];
  for (const item of input) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role === "model" ? "model" : "user";
    const raw = (item as { text?: unknown }).text;
    if (typeof raw !== "string") continue;
    const text = raw.replace(/\s+/g, " ").trim().slice(0, MAX_TEXT);
    if (text) turns.push({ role, text });
  }
  const recent = turns.slice(-MAX_TURNS);
  while (recent.length > 0 && recent[recent.length - 1].role !== "user") recent.pop();
  while (recent.length > 0 && recent[0].role !== "user") recent.shift();
  return recent;
}

type GroundingChunk = { web?: { uri?: string; title?: string } };
export type GroundingMetadata = { groundingChunks?: GroundingChunk[]; webSearchQueries?: string[] };

// Chi nhan link https (chan javascript:/data: neu du lieu la la), bo trung theo tieu de,
// toi da `limit` nguon.
export function extractSources(meta: GroundingMetadata | undefined, limit = 4): ChatSource[] {
  const out: ChatSource[] = [];
  const seen = new Set<string>();
  for (const chunk of meta?.groundingChunks ?? []) {
    const uri = chunk.web?.uri;
    if (typeof uri !== "string" || !/^https:\/\//i.test(uri)) continue;
    let host = "";
    try {
      host = new URL(uri).hostname;
    } catch {
      continue;
    }
    const title = (chunk.web?.title || host).trim().slice(0, 80);
    const key = title.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ title, uri });
    if (out.length >= limit) break;
  }
  return out;
}

export function extractSearchQueries(meta: GroundingMetadata | undefined, limit = 3): string[] {
  const qs = (meta?.webSearchQueries ?? []).filter((q): q is string => typeof q === "string" && q.trim().length > 0);
  return [...new Set(qs.map((q) => q.trim().slice(0, 120)))].slice(0, limit);
}

// Dem so luot goi co "Google Search" trong ngay - chan chi phi/quota ngoai y muon
// (bo nho tien trinh, reset khi restart; du cho muc bao ve co ban).
const dayCounters = new Map<string, number>();

export function takeGroundingSlot(dayKey: string, cap: number): boolean {
  const used = dayCounters.get(dayKey) ?? 0;
  if (used >= cap) return false;
  dayCounters.clear();
  dayCounters.set(dayKey, used + 1);
  return true;
}

// ---- Trich cum tu khoa tu cau hoi tu nhien de tim trong du lieu that cua trang ----
// searchSite() khop nguyen chuoi (contains) nen ca cau "cho minh hoi co homestay view bien
// khong" se khong ra gi. Bo tu hoi/dem, ten vung (Phan Thiet... co o gan nhu moi muc nen
// khop tat ca) roi lay cum con lai lam tu khoa.
const STOPWORDS = new Set(
  (
    "cho mình tôi em anh chị hỏi có không nào ở đâu là gì và của với muốn cần tìm xin bạn ơi nhé nha được thì thế này đó " +
    "một những các hay về tại giúp làm sao như nào rất quá hơn nhất còn hết bao nhiêu mấy khi nếu thì để đi đến từ trong " +
    "ngoài trên dưới cùng vừa cũng đang sẽ đã phải nên hãy vui lòng giùm phan thiết mũi né bình thuận"
  ).split(" ")
);

export function extractSearchPhrases(text: string, maxPhrases = 3): string[] {
  const tokens = text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
  if (tokens.length === 0) return [];
  const phrases: string[] = [];
  if (tokens.length <= 3) {
    phrases.push(tokens.join(" "));
  } else {
    for (let i = 0; i + 1 < tokens.length && phrases.length < maxPhrases; i++) phrases.push(`${tokens[i]} ${tokens[i + 1]}`);
  }
  return [...new Set(phrases)].slice(0, maxPhrases);
}

export const FOOD_INTENT_RE = /(ăn|quán|món|nhà hàng|hải sản|uống|nhậu|đặc sản|cà phê|cafe|buffet|lẩu|nướng)/i;

// Chuoi tim kiem web/Wikipedia: bo tu hoi/dem nhung GIU ten vung (Phan Thiet, Mui Ne...)
// vi voi tra cuu ngoai trang thi dia danh la ngu canh quan trong.
const REGION_WORDS = new Set(["phan", "thiết", "mũi", "né", "bình", "thuận"]);

export function extractWebQuery(text: string, maxTokens = 8): string {
  return text
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2 && (!STOPWORDS.has(t) || REGION_WORDS.has(t)))
    .slice(0, maxTokens)
    .join(" ");
}

// Loi chao/cam on/dong y: khong can tra cuu web
export const SMALL_TALK_RE = /^(xin chào|chào|hello|hi|alo|cảm ơn|cám ơn|thanks|thank you|ok|oke|okay|được rồi|tạm biệt|bye)\b/i;
