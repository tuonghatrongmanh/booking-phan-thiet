import { prisma } from "@/lib/prisma";
import { sendTelegramAlert, shouldAlertForIp } from "@/lib/telegram-alert";

// Duong dan/tien to KHONG ghi log (asset tinh, HMR, internal Next.js) - neu ghi het
// se ngap bang trong vai giay do 1 lan tai trang keo theo hang chuc file JS/CSS/anh.
const SKIP_PREFIXES = ["/_next/", "/__nextjs", "/socket.io/"];
const SKIP_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|ico|css|js|map|woff2?|ttf|eot|mp4|webm)$/i;

// Cac duong dan hay bi bot/scanner do quet lo hong pho bien (WordPress, PHP, secrets,
// git, cong cu quan tri DB...) - trang nay la Next.js/React nen KHONG bao gio co that
// nhung duong dan nay, request toi day gan nhu chac chan la do quet tu dong/tan cong.
// "high": co the lay duoc bi mat that su (secrets/key/path traversal). "medium": quet
// lo hong pho bien nhung it rui ro truc tiep hon (WordPress/PHP tren site khong dung PHP).
const SUSPICIOUS_PATTERNS: { pattern: RegExp; severity: "high" | "medium" }[] = [
  { pattern: /\.env($|\.)/i, severity: "high" },
  { pattern: /\.git(\/|$)/i, severity: "high" },
  { pattern: /id_rsa|\.ssh\//i, severity: "high" },
  { pattern: /(^|\/)(config|secrets?|credentials)\.(json|ya?ml|xml)$/i, severity: "high" },
  { pattern: /\/(node_modules|\.next\/server|prisma\/schema\.prisma)/i, severity: "high" },
  { pattern: /\/\.\.(\/|%2e%2e)/i, severity: "high" }, // path traversal
  { pattern: /wp-(login|admin|content|includes)/i, severity: "medium" },
  { pattern: /xmlrpc\.php/i, severity: "medium" },
  { pattern: /phpmyadmin/i, severity: "medium" },
  { pattern: /\.php$/i, severity: "medium" },
  { pattern: /\.(asp|aspx|jsp)$/i, severity: "medium" },
  { pattern: /\/(actuator|swagger|graphql-playground)/i, severity: "medium" },
];

const RATE_WINDOW_MS = 10_000;
const RATE_THRESHOLD = 40; // so request toi da tu 1 IP trong RATE_WINDOW_MS truoc khi bi danh dau bat thuong

const ipHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  ipHits.set(ip, hits);
  return hits.length > RATE_THRESHOLD;
}

// Don dep bo nho dinh ky de tranh phinh to vo han khi chay lau dai
setInterval(() => {
  const now = Date.now();
  for (const [ip, hits] of ipHits) {
    const fresh = hits.filter((t) => now - t < RATE_WINDOW_MS);
    if (fresh.length === 0) ipHits.delete(ip);
    else ipHits.set(ip, fresh);
  }
}, 60_000).unref();

export function shouldLogPath(pathname: string): boolean {
  if (SKIP_PREFIXES.some((p) => pathname.startsWith(p))) return false;
  if (SKIP_EXTENSIONS.test(pathname)) return false;
  return true;
}

function isPrivateIp(ip: string): boolean {
  // IPv4 co the duoc bieu dien dang IPv6-mapped "::ffff:x.x.x.x" tren mot so stack -
  // bo tien to nay truoc khi so sanh de khong lot luoi cac dai private/loopback.
  const normalized = ip.replace(/^::ffff:/i, "");
  return (
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.startsWith("192.168.") ||
    normalized.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized) ||
    normalized === "" ||
    normalized === "unknown"
  );
}

async function resolveGeoIp(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (isPrivateIp(ip)) return { country: "Local/Private", city: null };

  const cached = await prisma.ipInfo.findUnique({ where: { ip } });
  if (cached) return { country: cached.country, city: cached.city };

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city,isp`);
    const data = (await res.json()) as { status: string; country?: string; city?: string; isp?: string };
    if (data.status !== "success") return { country: null, city: null }; // khong cache ket qua loi - de lan sau thu lai

    const country = data.country ?? null;
    const city = data.city ?? null;
    await prisma.ipInfo
      .upsert({
        where: { ip },
        create: { ip, country, city, isp: data.isp ?? null },
        update: { country, city, isp: data.isp ?? null },
      })
      .catch(() => {});
    return { country, city };
  } catch {
    return { country: null, city: null };
  }
}

export function getClientIp(headers: Record<string, string | string[] | undefined>, socketIp?: string): string {
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
    if (first?.trim()) return first.trim();
  }
  return socketIp || "unknown";
}

// Ghi 1 dong log (fire-and-forget - goi noi nay KHONG duoc await truoc khi tra ve
// response cho client, tranh lam cham moi request that vi 1 lan tra cuu geo-IP).
export async function logRequest(params: {
  ip: string;
  path: string;
  method: string;
  userAgent: string | null;
  durationMs?: number;
  statusCode?: number;
  admin?: { email: string | null; name: string | null } | null;
}) {
  const { ip, path, method, userAgent, durationMs, statusCode, admin } = params;

  const rateLimited = isRateLimited(ip);
  const patternMatch = SUSPICIOUS_PATTERNS.find((p) => p.pattern.test(path));
  const suspicious = rateLimited || !!patternMatch;
  const reason = rateLimited
    ? `Vượt ngưỡng ${RATE_THRESHOLD} request/${RATE_WINDOW_MS / 1000}s`
    : patternMatch
      ? "Đường dẫn khả nghi (dò quét tự động)"
      : null;
  const severity = rateLimited ? "high" : (patternMatch?.severity ?? null);

  const { country, city } = await resolveGeoIp(ip);

  await prisma.requestLog
    .create({
      data: {
        ip, path, method, userAgent, country, city, suspicious, reason, severity, durationMs, statusCode,
        adminEmail: admin?.email ?? null,
        adminName: admin?.name ?? null,
      },
    })
    .catch(() => {});

  // Canh bao tuc thoi qua Telegram cho su kien muc "high" - gioi han 1 lan/10 phut
  // moi IP de khong spam khi 1 nguon lap lai lien tuc.
  if (severity === "high" && shouldAlertForIp(ip)) {
    void sendTelegramAlert(
      `⚠️ <b>Cảnh báo bảo mật (Cao)</b>\nIP: ${ip}${country ? ` (${city ? city + ", " : ""}${country})` : ""}\nĐường dẫn: ${method} ${path}\nLý do: ${reason}`
    ).catch(() => {});
  }
}

// Cache danh sach IP bi chan trong bo nho (lam moi dinh ky) de KHONG phai truy van DB
// tren MOI request - chi anh huong toi UX ngay sau khi admin bam "Chan IP" (cho toi
// 30s la cham nhat de co hieu luc, chap nhan duoc doi voi 1 tinh nang quan tri thu cong).
let blockedIpsCache = new Set<string>();

async function refreshBlockedIps() {
  try {
    const rows = await prisma.blockedIp.findMany({ select: { ip: true } });
    blockedIpsCache = new Set(rows.map((r) => r.ip));
  } catch {
    // giu nguyen cache cu neu DB tam thoi loi
  }
}

export function isIpBlocked(ip: string): boolean {
  return blockedIpsCache.has(ip);
}

export async function initBlockedIpsWatcher() {
  await refreshBlockedIps();
  setInterval(() => {
    void refreshBlockedIps();
  }, 30_000).unref();
}
