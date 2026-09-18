import { createHash } from "crypto";
import { SITE_URL } from "@/lib/site-url";

// IndexNow: giao thức mở để BÁO NGAY cho công cụ tìm kiếm khi có URL mới/đã sửa/đã xóa,
// thay vì chờ họ tự crawl lại. Được Bing, Yandex, Naver, Seznam, Yep hỗ trợ.
// LƯU Ý: Google KHÔNG dùng IndexNow - Google vẫn dựa vào sitemap.xml + Search Console.
//
// Không cần đăng ký tài khoản: key do server tự sinh (cố định theo NEXTAUTH_SECRET) và
// được phục vụ tại /<key>.txt để công cụ tìm kiếm xác minh quyền sở hữu domain.
// Chỉ gửi ở production - tránh báo URL của máy dev/staging.

const ENDPOINT = "https://api.indexnow.org/indexnow";
const THROTTLE_MS = 10 * 60 * 1000; // cùng 1 URL chỉ báo tối đa 1 lần / 10 phút (admin hay lưu nhiều lần)

const lastPinged = new Map<string, number>();

export function getIndexNowKey(): string | null {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return createHash("sha256").update(`indexnow:${secret}`).digest("hex").slice(0, 32);
}

function isPublicProductionSite(): boolean {
  if (process.env.NODE_ENV !== "production") return false;
  try {
    const host = new URL(SITE_URL).hostname;
    return host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".local");
  } catch {
    return false;
  }
}

export function pingIndexNow(urls: (string | null | undefined)[]): void {
  const key = getIndexNowKey();
  if (!key || !isPublicProductionSite()) return;

  const now = Date.now();
  const fresh = [...new Set(urls.filter((u): u is string => Boolean(u)))].filter((u) => {
    const last = lastPinged.get(u);
    return !last || now - last > THROTTLE_MS;
  });
  if (fresh.length === 0) return;
  fresh.forEach((u) => lastPinged.set(u, now));

  // Fire-and-forget: lỗi mạng của bên thứ ba không được làm hỏng thao tác lưu của admin.
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: new URL(SITE_URL).hostname,
      key,
      keyLocation: `${SITE_URL}/${key}.txt`,
      urlList: fresh,
    }),
    signal: AbortSignal.timeout(8000),
  })
    .then((res) => {
      if (!res.ok && res.status !== 202) console.error(`[indexnow] ${res.status} khi báo ${fresh.length} URL`);
    })
    .catch((err) => console.error("[indexnow] gửi thất bại:", err));
}

export function newsPublicUrl(slug: string): string {
  return `${SITE_URL}/tin-tuc/${slug}`;
}

export function foodPublicUrl(slug: string): string {
  return `${SITE_URL}/am-thuc/mon/${slug}`;
}

// Chỉ các category có trang chi tiết công khai riêng (khớp với sitemap.xml).
export function placePublicUrl(place: { id: string; category: string; hidden?: boolean }): string | null {
  if (place.hidden) return null;
  if (place.category === "HOMESTAY") return `${SITE_URL}/luu-tru/${place.id}`;
  if (place.category === "ATTRACTION") return `${SITE_URL}/diem-tham-quan/${place.id}`;
  if (place.category === "SALE") return `${SITE_URL}/sale/${place.id}`;
  return null;
}
