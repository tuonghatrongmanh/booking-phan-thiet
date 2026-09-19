import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { SITE_URL } from "@/lib/site-url";
import { telegramApi, webhookSecret } from "@/lib/telegram-bot";

const HOOK_URL = `${SITE_URL}/api/telegram/webhook`;

// GET: trạng thái nút xác nhận trong Telegram (webhook đã trỏ đúng site chưa, có lỗi gần nhất không)
export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;
  if (!process.env.TELEGRAM_BOT_TOKEN) return NextResponse.json({ configured: false, active: false });
  const info = await telegramApi("getWebhookInfo", {});
  const r = (info.result ?? {}) as { url?: string; last_error_message?: string; pending_update_count?: number };
  return NextResponse.json({ configured: true, active: r.url === HOOK_URL, url: r.url || null, lastError: r.last_error_message ?? null, expected: HOOK_URL });
}

// POST: bật nút xác nhận - đăng ký webhook với Telegram (chạy trên site thật, HTTPS công khai)
export async function POST() {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const secret = webhookSecret();
  if (!process.env.TELEGRAM_BOT_TOKEN || !secret) {
    return NextResponse.json({ error: "Server chưa có TELEGRAM_BOT_TOKEN (thêm ở Render → Environment)" }, { status: 400 });
  }
  if (!HOOK_URL.startsWith("https://") || /localhost|127\.0\.0\.1/.test(HOOK_URL)) {
    return NextResponse.json({ error: "Chỉ bật được trên website thật (HTTPS), không bật được ở máy local" }, { status: 400 });
  }
  const res = await telegramApi("setWebhook", { url: HOOK_URL, secret_token: secret, allowed_updates: ["callback_query"], drop_pending_updates: true });
  if (!res.ok) return NextResponse.json({ error: `Telegram từ chối: ${res.description ?? "không rõ lý do"}` }, { status: 502 });
  await logAdminAction(admin, "enable", "telegram-webhook", "telegram", "Bật nút xác nhận cọc trong Telegram");
  return NextResponse.json({ ok: true });
}
