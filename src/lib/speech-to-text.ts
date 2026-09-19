import { AI_GEMINI_MODEL } from "@/lib/ai-assistant";

const PROMPT =
  "Đây là đoạn ghi âm giọng nói tiếng Việt của một khách du lịch đang hỏi/tìm kiếm trên website đặt phòng Phan Thiết. " +
  "Hãy chép lại CHÍNH XÁC lời họ nói, có dấu tiếng Việt đầy đủ, viết thành một câu tự nhiên. " +
  "Nếu lời nói không phải tiếng Việt thì chép nguyên văn ngôn ngữ đó, không dịch. Chỉ trả về đúng nội dung câu nói, không giải thích, không đặt trong ngoặc kép. " +
  "Nếu không nghe thấy lời nói rõ ràng thì trả về đúng một chuỗi rỗng.";

export const MAX_AUDIO_BYTES = 1_200_000; // ~ 20 giây WAV 16kHz mono 16-bit (640KB) + dư
export const MIN_AUDIO_BYTES = 6_000; // < ~0.2 giây thì bỏ

// Dọn kết quả model: bỏ ngoặc kép, ghi chú kiểu [không rõ], giới hạn độ dài
export function cleanTranscript(raw: string): string {
  const t = raw
    .replace(/[\r\n]+/g, " ")
    .replace(/^["“”'`]+|["“”'`]+$/g, "")
    .replace(/\[[^\]]*\]|\([^)]*\)/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t.slice(0, 300);
}

// Gemini nhận WAV (inline base64) và chép lời. Trả về "" nếu không nghe rõ (thử lại 1 lần vì thỉnh thoảng model trả rỗng).
export async function transcribeWav(wav: Buffer): Promise<{ text: string } | { error: string }> {
  const first = await transcribeOnce(wav);
  if ("error" in first || first.text) return first;
  return transcribeOnce(wav);
}

async function transcribeOnce(wav: Buffer): Promise<{ text: string } | { error: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { error: "Chưa cấu hình nhận dạng giọng nói" };

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${AI_GEMINI_MODEL}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: PROMPT }, { inline_data: { mime_type: "audio/wav", data: wav.toString("base64") } }] }],
        generationConfig: { temperature: 0, maxOutputTokens: 200 },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.error("[speech-to-text] Gemini lỗi", res.status);
      return { error: "Chưa chuyển được giọng nói thành chữ, bạn thử lại nhé" };
    }
    const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    return { text: cleanTranscript(raw) };
  } catch (err) {
    console.error("[speech-to-text] Lỗi:", err);
    return { error: "Chưa chuyển được giọng nói thành chữ, bạn thử lại nhé" };
  }
}
