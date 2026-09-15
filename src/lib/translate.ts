// Goi truc tiep endpoint mien phi ma trang translate.google.com dung cho ban dich
// nhanh o trinh duyet (khong phai Google Cloud Translation API co phi). Day la endpoint
// khong chinh thuc, khong can API key, nhung khong co cam ket on dinh tu Google - phu
// hop vi he thong nay chi goi no 1 lan luc admin luu bai (khong phai moi luot khach xem).
const GOOGLE_LOCALE: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  zh: "zh-CN",
  ja: "ja",
  ko: "ko",
};

const MAX_CHUNK = 1800;

function splitIntoChunks(text: string): string[] {
  if (text.length <= MAX_CHUNK) return [text];
  const chunks: string[] = [];
  let rest = text;
  while (rest.length > MAX_CHUNK) {
    let cut = rest.lastIndexOf("\n", MAX_CHUNK);
    if (cut < MAX_CHUNK * 0.5) cut = rest.lastIndexOf(". ", MAX_CHUNK);
    if (cut < MAX_CHUNK * 0.5) cut = MAX_CHUNK;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  if (rest) chunks.push(rest);
  return chunks;
}

async function translateChunk(text: string, targetLocale: string, sourceLocale: string): Promise<string> {
  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=${sourceLocale}&tl=${targetLocale}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Translate trả lỗi ${res.status}`);

  const data = (await res.json()) as unknown;
  const segments = Array.isArray(data) ? (data[0] as unknown) : null;
  if (!Array.isArray(segments)) throw new Error("Google Translate trả về dữ liệu không đúng định dạng");

  return segments.map((seg) => (Array.isArray(seg) ? String(seg[0] ?? "") : "")).join("");
}

// locale: ma ngon ngu noi bo cua site (en/es/fr/zh/ja/ko) - vi khong can dich (giu nguyen).
export async function translateText(text: string, locale: string, sourceLocale = "vi"): Promise<string> {
  const trimmed = text?.trim();
  if (!trimmed) return text ?? "";

  const target = GOOGLE_LOCALE[locale];
  if (!target) throw new Error(`Không hỗ trợ dịch sang locale "${locale}"`);

  const chunks = splitIntoChunks(text);
  const translated = await Promise.all(chunks.map((chunk) => translateChunk(chunk, target, sourceLocale)));
  return translated.join("");
}
