import type { ChatSource } from "@/lib/ai-chat-utils";

// Tra cuu thong tin NGOAI trang (thoi tiet, kien thuc chung, tin tuc...) de tro ly AI tra
// loi co dan chung. Key Gemini mien phi KHONG co quota "Grounding with Google Search" (moi
// model deu tra 429), nen xay chuoi tra cuu mien phi, moi nguon deu that va co link:
//   1. Thoi tiet  -> Open-Meteo (khong can key)
//   2. Google     -> Serper.dev (ket qua Google that; can SERPER_API_KEY, goi mien phi 2.500 luot)
//   3. Kien thuc  -> Wikipedia tieng Viet (khong can key) khi khong co Serper
// Ket qua tra ve la doan van ban ngan dua vao prompt + danh sach nguon hien cho khach.
export type WebContext = { text: string; sources: ChatSource[]; searchQueries: string[] };

const TIMEOUT_MS = 6000;

// Phan Thiet (trung tam) - dung cho du bao thoi tiet
const PHAN_THIET = { lat: 10.9289, lon: 108.1021 };

export const WEATHER_RE = /(thời tiết|nhiệt độ|nắng|mưa|gió|bão|dự báo|nóng|lạnh|sóng biển|biển động)/i;

const WEATHER_CODES: [number[], string][] = [
  [[0], "trời quang"],
  [[1, 2], "ít mây"],
  [[3], "nhiều mây"],
  [[45, 48], "có sương mù"],
  [[51, 53, 55, 56, 57], "mưa phùn"],
  [[61, 63, 65, 66, 67], "mưa"],
  [[80, 81, 82], "mưa rào"],
  [[95, 96, 99], "dông, có sấm sét"],
];

export function describeWeatherCode(code: number): string {
  return WEATHER_CODES.find(([codes]) => codes.includes(code))?.[1] ?? "thời tiết thay đổi";
}

type OpenMeteo = {
  current?: { temperature_2m?: number; weather_code?: number; wind_speed_10m?: number };
  daily?: {
    time?: string[];
    weather_code?: number[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    precipitation_probability_max?: number[];
    wind_speed_10m_max?: number[];
  };
};

const WEEKDAYS = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];

export function formatWeatherContext(data: OpenMeteo): string | null {
  const d = data.daily;
  if (!d?.time?.length) return null;
  const lines = d.time.slice(0, 7).map((iso, i) => {
    const [y, m, day] = iso.split("-").map(Number);
    const wd = WEEKDAYS[new Date(Date.UTC(y, m - 1, day)).getUTCDay()];
    const parts = [
      describeWeatherCode(d.weather_code?.[i] ?? -1),
      d.temperature_2m_min?.[i] != null && d.temperature_2m_max?.[i] != null
        ? `${Math.round(d.temperature_2m_min[i])}-${Math.round(d.temperature_2m_max[i])}°C`
        : null,
      d.precipitation_probability_max?.[i] != null ? `khả năng mưa ${d.precipitation_probability_max[i]}%` : null,
      d.wind_speed_10m_max?.[i] != null ? `gió tối đa ${Math.round(d.wind_speed_10m_max[i])} km/h` : null,
    ].filter(Boolean);
    return `- ${wd} ${String(day).padStart(2, "0")}/${String(m).padStart(2, "0")}: ${parts.join(", ")}`;
  });
  const cur = data.current;
  const now =
    cur?.temperature_2m != null
      ? `Hiện tại: ${Math.round(cur.temperature_2m)}°C, ${describeWeatherCode(cur.weather_code ?? -1)}.\n`
      : "";
  return `DỰ BÁO THỜI TIẾT PHAN THIẾT (nguồn Open-Meteo, giờ Việt Nam):\n${now}${lines.join("\n")}`;
}

async function getJson(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function lookupWeather(): Promise<WebContext | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${PHAN_THIET.lat}&longitude=${PHAN_THIET.lon}` +
    "&current=temperature_2m,weather_code,wind_speed_10m" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max" +
    "&timezone=Asia%2FBangkok&forecast_days=7";
  const text = formatWeatherContext((await getJson(url)) as OpenMeteo);
  if (!text) return null;
  return { text, sources: [{ title: "Open-Meteo (dự báo thời tiết)", uri: "https://open-meteo.com/" }], searchQueries: [] };
}

type SerperResponse = {
  answerBox?: { title?: string; answer?: string; snippet?: string };
  knowledgeGraph?: { title?: string; description?: string };
  organic?: { title?: string; link?: string; snippet?: string }[];
};

export function formatSerperContext(data: SerperResponse, limit = 5): WebContext | null {
  const lines: string[] = [];
  const sources: ChatSource[] = [];
  const box = data.answerBox;
  if (box && (box.answer || box.snippet)) lines.push(`Trả lời nhanh của Google: ${(box.answer || box.snippet || "").slice(0, 300)}`);
  const kg = data.knowledgeGraph;
  if (kg?.description) lines.push(`${kg.title ?? "Thông tin"}: ${kg.description.slice(0, 300)}`);
  for (const r of (data.organic ?? []).slice(0, limit)) {
    if (!r.link || !/^https:\/\//i.test(r.link) || !r.title) continue;
    lines.push(`[${sources.length + 1}] ${r.title}: ${(r.snippet ?? "").slice(0, 260)}`);
    sources.push({ title: r.title.slice(0, 80), uri: r.link });
  }
  if (lines.length === 0) return null;
  return {
    text: `KẾT QUẢ TÌM KIẾM GOOGLE (số [n] tương ứng nguồn hiển thị cho khách):\n${lines.join("\n")}`,
    sources,
    searchQueries: [],
  };
}

export async function lookupGoogle(query: string, apiKey: string): Promise<WebContext | null> {
  const data = (await getJson("https://google.serper.dev/search", {
    method: "POST",
    headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, gl: "vn", hl: "vi", num: 5 }),
  })) as SerperResponse;
  const ctx = formatSerperContext(data);
  return ctx ? { ...ctx, searchQueries: [query] } : null;
}

type WikiResponse = {
  query?: { pages?: Record<string, { pageid?: number; title?: string; extract?: string; index?: number }> };
};

export function formatWikiContext(data: WikiResponse, limit = 3): WebContext | null {
  const pages = Object.values(data.query?.pages ?? {})
    .filter((p) => p.pageid && p.title && p.extract)
    .sort((a, b) => (a.index ?? 99) - (b.index ?? 99))
    .slice(0, limit);
  if (pages.length === 0) return null;
  const sources: ChatSource[] = pages.map((p) => ({
    title: `Wikipedia: ${p.title}`.slice(0, 80),
    uri: `https://vi.wikipedia.org/?curid=${p.pageid}`,
  }));
  const lines = pages.map((p, i) => `[${i + 1}] ${p.title}: ${(p.extract ?? "").replace(/\s+/g, " ").slice(0, 600)}`);
  return { text: `THÔNG TIN TỪ WIKIPEDIA TIẾNG VIỆT (số [n] tương ứng nguồn hiển thị cho khách):\n${lines.join("\n")}`, sources, searchQueries: [] };
}

export async function lookupWikipedia(query: string): Promise<WebContext | null> {
  const url =
    "https://vi.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=3&prop=extracts" +
    `&exintro=1&explaintext=1&exchars=700&origin=*&gsrsearch=${encodeURIComponent(query)}`;
  const ctx = formatWikiContext((await getJson(url)) as WikiResponse);
  return ctx ? { ...ctx, searchQueries: [query] } : null;
}

// Gop cac nguon phu hop cho 1 cau hoi. Moi nguon tu bat loi (mang cham/khong co key) de
// khong lam hong ca cau tra loi - khong tra cuu duoc thi tro ly tra loi "chua tra cuu duoc".
export async function lookupWeb(question: string, searchPhrase: string): Promise<WebContext | null> {
  const parts: WebContext[] = [];

  if (WEATHER_RE.test(question)) {
    const weather = await lookupWeather().catch((err) => {
      console.error("[web-lookup] Open-Meteo lỗi:", err);
      return null;
    });
    if (weather) parts.push(weather);
  }

  // Hoi thoi tiet ma da co du bao thi khong can them ket qua tim kiem chung
  if (parts.length === 0) {
    const serperKey = process.env.SERPER_API_KEY;
    const general = await (serperKey ? lookupGoogle(question, serperKey) : lookupWikipedia(searchPhrase || question)).catch((err) => {
      console.error("[web-lookup] Tra cứu web lỗi:", err);
      return null;
    });
    if (general) parts.push(general);
  }

  if (parts.length === 0) return null;
  return {
    text: parts.map((p) => p.text).join("\n\n"),
    sources: parts.flatMap((p) => p.sources).slice(0, 5),
    searchQueries: parts.flatMap((p) => p.searchQueries).slice(0, 3),
  };
}
