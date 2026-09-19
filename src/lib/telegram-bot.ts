import { createHash, timingSafeEqual } from "crypto";

// Nút bấm xác nhận cọc ngay trong Telegram. Telegram gửi mỗi lần bấm về /api/telegram/webhook;
// ta xác thực bằng (1) secret_token đặt lúc setWebhook, (2) chỉ chấp nhận đúng tài khoản chủ web.
export type InlineButton = { text: string; callback_data: string };
export type InlineKeyboard = InlineButton[][];

// --- dữ liệu nút: dep:<hành động>:<loại đơn>:<id>  (Telegram giới hạn 64 byte) ---
export type DepositAction = "ok" | "cf" | "no" | "nf" | "bk";
export type ParsedCallback = { action: DepositAction; kind: "stay" | "rental"; id: string };

export function buildCallbackData(action: DepositAction, kind: "stay" | "rental", id: string): string {
  return `dep:${action}:${kind === "stay" ? "s" : "r"}:${id}`;
}

export function parseCallbackData(data: string | undefined): ParsedCallback | null {
  const m = data?.match(/^dep:(ok|cf|no|nf|bk):([sr]):([A-Za-z0-9_-]{10,40})$/);
  if (!m) return null;
  return { action: m[1] as DepositAction, kind: m[2] === "s" ? "stay" : "rental", id: m[3] };
}

const vnd = (n: number) => `${n.toLocaleString("vi-VN")}đ`;

// Bàn phím ban đầu: đơn mới (chỉ nút nhận cọc) hoặc khách báo đã chuyển (thêm nút chưa nhận được)
export function initialKeyboard(kind: "stay" | "rental", id: string, customerReported: boolean): InlineKeyboard {
  const row: InlineButton[] = [{ text: "✅ Đã nhận cọc", callback_data: buildCallbackData("ok", kind, id) }];
  if (customerReported) row.push({ text: "❌ Chưa nhận được", callback_data: buildCallbackData("no", kind, id) });
  return [row];
}

// Bước xác nhận lần 2 - tránh bấm nhầm (xác nhận cọc chiếm phòng/xe, từ chối thì gửi email cho khách)
export function confirmKeyboard(action: "ok" | "no", kind: "stay" | "rental", id: string, amount: number | null): InlineKeyboard {
  const final: DepositAction = action === "ok" ? "cf" : "nf";
  const text = action === "ok" ? `✅ Chắc chắn đã nhận ${amount ? vnd(amount) : "đủ tiền"}` : "❌ Chắc chắn CHƯA thấy tiền";
  return [[{ text, callback_data: buildCallbackData(final, kind, id) }], [{ text: "↩ Quay lại", callback_data: buildCallbackData("bk", kind, id) }]];
}

// --- xác thực ---
export function webhookSecret(): string | null {
  const base = process.env.NEXTAUTH_SECRET;
  if (!base) return null;
  return createHash("sha256").update(`telegram-webhook:${base}`).digest("hex").slice(0, 48);
}

export function secretMatches(header: string | null): boolean {
  const expected = webhookSecret();
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Chỉ cho phép đúng chủ: chat riêng (chat id dương) thì người bấm phải chính là chat đó; nếu dùng
// nhóm (chat id âm) phải liệt kê user id được phép trong TELEGRAM_ADMIN_USER_IDS (cách nhau bằng dấu phẩy).
export function isAuthorizedTelegramUser(fromId: number | string, env: { chatId?: string; adminIds?: string } = { chatId: process.env.TELEGRAM_CHAT_ID, adminIds: process.env.TELEGRAM_ADMIN_USER_IDS }): boolean {
  const from = String(fromId);
  const allowed = new Set((env.adminIds ?? "").split(",").map((s) => s.trim()).filter(Boolean));
  if (env.chatId && !env.chatId.startsWith("-")) allowed.add(env.chatId.trim());
  return allowed.has(from);
}

// --- gọi API Telegram ---
export async function telegramApi(method: string, body: Record<string, unknown>): Promise<{ ok: boolean; result?: unknown; description?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, description: "Chưa có TELEGRAM_BOT_TOKEN" };
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });
    return (await res.json()) as { ok: boolean; result?: unknown; description?: string };
  } catch (err) {
    console.error("[telegram-bot]", method, "lỗi:", err);
    return { ok: false, description: "Không gọi được Telegram" };
  }
}
