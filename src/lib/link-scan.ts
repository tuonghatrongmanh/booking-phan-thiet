// Quét liên kết độc hại trong nội dung người dùng tự đăng (diễn đàn, bình luận) qua
// Google Safe Browsing (miễn phí). Nếu chưa cấu hình GOOGLE_SAFE_BROWSING_API_KEY thì
// BỎ QUA kiểm tra (không chặn đăng bài) - đây là lớp phòng thủ THÊM, không phải lớp
// duy nhất, nên không có API key không nên làm gián người dùng.

const URL_REGEX = /https?:\/\/[^\s<>"'\)]+/gi;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? [];
  return Array.from(new Set(matches));
}

type ThreatEntry = { threat: { url: string } };

export async function findMaliciousUrls(urls: string[]): Promise<string[]> {
  if (urls.length === 0) return [];

  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    console.warn("[link-scan] Chưa cấu hình GOOGLE_SAFE_BROWSING_API_KEY - bỏ qua kiểm tra link.");
    return [];
  }

  try {
    const res = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client: { clientId: "booking-phan-thiet", clientVersion: "1.0.0" },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: urls.map((url) => ({ url })),
        },
      }),
    });

    if (!res.ok) {
      console.error("[link-scan] Safe Browsing trả về lỗi:", await res.text().catch(() => ""));
      return [];
    }

    const data = (await res.json()) as { matches?: ThreatEntry[] };
    return Array.from(new Set((data.matches ?? []).map((m) => m.threat.url)));
  } catch (err) {
    console.error("[link-scan] Lỗi khi gọi Safe Browsing API:", err);
    return [];
  }
}
