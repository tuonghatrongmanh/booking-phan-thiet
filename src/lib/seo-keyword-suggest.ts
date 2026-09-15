// Goi Gemini (cung API key/model voi src/lib/ai-assistant.ts) de goi y tu khoa SEO cho
// bai viet - dua vao tieu de + mo ta ngan + danh muc. Chi chay khi admin bam nut, KHONG
// tu dong chay moi lan go phim (khac voi analyzeSeo() la thuan client, khong goi API).
const GEMINI_MODEL = "gemini-2.5-flash";

export type KeywordSuggestion = {
  focusKeyword: string;
  related: string[];
};

function buildPrompt(title: string, excerpt: string, category: string): string {
  return `Bạn là chuyên gia SEO tiếng Việt cho website du lịch Phan Thiết (bookingphanthiet.com).

Bài viết:
- Tiêu đề: "${title}"
- Mô tả ngắn: "${excerpt || "(chưa có)"}"
- Danh mục: ${category}

Hãy đề xuất từ khóa SEO cho bài viết này. Trả lời DUY NHẤT bằng JSON theo đúng format sau, không thêm giải thích:
{"focusKeyword": "1 cụm từ khóa chính phù hợp nhất để xếp hạng Google (3-6 từ, tự nhiên, đúng ý định tìm kiếm)", "related": ["5 đến 8 từ khóa liên quan/phụ (LSI keywords) mà bài viết nên nhắc tới để Google hiểu chủ đề đầy đủ hơn"]}`;
}

export async function suggestKeywords(title: string, excerpt: string, category: string): Promise<KeywordSuggestion | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: buildPrompt(title, excerpt, category) }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 400, responseMimeType: "application/json" },
        }),
      }
    );

    if (!res.ok) throw new Error(`Gemini trả lỗi ${res.status}`);

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    const parsed = JSON.parse(text) as KeywordSuggestion;
    if (!parsed.focusKeyword || !Array.isArray(parsed.related)) return null;
    return { focusKeyword: parsed.focusKeyword, related: parsed.related.slice(0, 8) };
  } catch (err) {
    console.error("[seo-keyword-suggest] Lỗi gọi Gemini:", err);
    return null;
  }
}
