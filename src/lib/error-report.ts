import { rateLimit } from "@/lib/rate-limit";
import { sendTelegramAlert } from "@/lib/telegram-alert";

// Báo lỗi máy chủ (500) về Telegram của chủ web - không cần đăng ký dịch vụ ngoài. Chỉ chạy khi deploy thật
// (NODE_ENV=production) hoặc đặt ERROR_ALERTS=on; đặt ERROR_ALERTS=off để tắt hẳn.
type ReqInfo = { path: string; method: string };
type Ctx = { routePath?: string; routeType?: string };

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function errorMessageOf(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

// Bỏ qua các "lỗi" là luồng bình thường của Next (chuyển hướng, 404) và lỗi do trang tĩnh/động.
export function shouldReportError(err: unknown): boolean {
  const digest = typeof err === "object" && err !== null && "digest" in err ? String((err as { digest: unknown }).digest) : "";
  if (digest.startsWith("NEXT_") || digest.includes("DYNAMIC_SERVER_USAGE") || digest.includes("BAILOUT_TO_CLIENT_SIDE_RENDERING")) return false;
  const msg = errorMessageOf(err);
  if (/Dynamic server usage|NEXT_REDIRECT|NEXT_NOT_FOUND|NEXT_HTTP_ERROR_FALLBACK/.test(msg)) return false;
  return true;
}

export function formatErrorAlert(err: unknown, req: ReqInfo, ctx: Ctx): string {
  const path = (req.path || "").split("?")[0].slice(0, 160); // bỏ query string: có thể chứa thông tin cá nhân
  const digest = typeof err === "object" && err !== null && "digest" in err ? String((err as { digest: unknown }).digest) : "";
  return [
    "🔴 <b>Lỗi máy chủ Booking Phan Thiết</b>",
    `Trang: <code>${escapeHtml(`${req.method} ${path}`)}</code>`,
    ctx.routePath ? `Route: <code>${escapeHtml(ctx.routePath)}</code> (${escapeHtml(ctx.routeType ?? "?")})` : "",
    `Lỗi: ${escapeHtml(errorMessageOf(err).slice(0, 300))}`,
    digest ? `Mã: <code>${escapeHtml(digest)}</code>` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function reportServerError(err: unknown, req: ReqInfo, ctx: Ctx): Promise<void> {
  const enabled = process.env.ERROR_ALERTS === "on" || (process.env.NODE_ENV === "production" && process.env.ERROR_ALERTS !== "off");
  if (!enabled || !shouldReportError(err)) return;
  const signature = `${ctx.routePath ?? req.path}:${errorMessageOf(err).slice(0, 80)}`;
  // Cùng 1 lỗi: tối đa 1 tin / 15 phút; toàn hệ thống: tối đa 8 tin / giờ (tránh ngập Telegram khi sự cố lan rộng)
  if (!rateLimit(`err-sig:${signature}`, 1, 15 * 60_000)) return;
  if (!rateLimit("err-global", 8, 60 * 60_000)) return;
  await sendTelegramAlert(formatErrorAlert(err, req, ctx));
}
