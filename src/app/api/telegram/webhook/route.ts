import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmDeposit, rejectClaim } from "@/lib/booking-actions";
import {
  confirmKeyboard,
  initialKeyboard,
  isAuthorizedTelegramUser,
  parseCallbackData,
  secretMatches,
  telegramApi,
} from "@/lib/telegram-bot";
import type { BookingKindKey } from "@/lib/booking-actions";

// Telegram gọi về đây mỗi khi chủ web bấm nút trong tin báo đơn. Xác thực 2 lớp: secret_token của
// webhook và chỉ đúng tài khoản chủ. Luôn trả 200 để Telegram không gửi lại.
const OK = () => NextResponse.json({ ok: true });

async function loadInquiry(kind: BookingKindKey, id: string) {
  const select = { depositAmount: true, depositStatus: true, customerReportedPaidAt: true } as const;
  return kind === "rental"
    ? prisma.rentalInquiry.findUnique({ where: { id }, select })
    : prisma.stayBookingInquiry.findUnique({ where: { id }, select });
}

export async function POST(req: NextRequest) {
  if (!secretMatches(req.headers.get("x-telegram-bot-api-secret-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const update = (await req.json().catch(() => null)) as {
    callback_query?: { id: string; data?: string; from?: { id: number }; message?: { message_id: number; chat: { id: number } } };
  } | null;
  const cb = update?.callback_query;
  if (!cb) return OK();

  const answer = (text: string, alert = false) => telegramApi("answerCallbackQuery", { callback_query_id: cb.id, text, show_alert: alert });

  if (!cb.from || !isAuthorizedTelegramUser(cb.from.id)) {
    await answer("Bạn không có quyền thao tác đơn này.", true);
    return OK();
  }
  const parsed = parseCallbackData(cb.data);
  const msg = cb.message;
  if (!parsed || !msg) {
    await answer("Nút này không còn hợp lệ.");
    return OK();
  }

  const { action, kind, id } = parsed;
  const setKeyboard = (inline_keyboard: unknown[]) =>
    telegramApi("editMessageReplyMarkup", { chat_id: msg.chat.id, message_id: msg.message_id, reply_markup: { inline_keyboard } });

  const inquiry = await loadInquiry(kind, id);
  if (!inquiry) {
    await answer("Không tìm thấy đơn (có thể đã bị xóa).", true);
    await setKeyboard([]);
    return OK();
  }

  if (action === "ok" || action === "no") {
    await setKeyboard(confirmKeyboard(action, kind, id, inquiry.depositAmount));
    await answer(action === "ok" ? "Bấm “Chắc chắn” để chốt cọc." : "Bấm để xác nhận CHƯA nhận được tiền.");
    return OK();
  }
  if (action === "bk") {
    await setKeyboard(initialKeyboard(kind, id, Boolean(inquiry.customerReportedPaidAt)));
    await answer("Đã quay lại.");
    return OK();
  }

  const actor = { telegram: { userId: String(cb.from.id) } };
  const result = action === "cf" ? await confirmDeposit(kind, id, actor) : await rejectClaim(kind, id, actor);
  if (!result.ok) {
    await answer(result.error.slice(0, 190), true);
    if (result.status === 400) await setKeyboard([]);
    return OK();
  }
  await setKeyboard([]);
  await answer(action === "cf" ? "✅ Đã xác nhận cọc" : "Đã ghi nhận: chưa nhận được tiền");
  await telegramApi("sendMessage", {
    chat_id: msg.chat.id,
    reply_to_message_id: msg.message_id,
    allow_sending_without_reply: true,
    text: action === "cf" ? `✅ Đã xác nhận cọc: ${result.label}. Khách được báo qua email (nếu có).` : `❌ Đã báo khách chưa nhận được tiền: ${result.label}.`,
  });
  return OK();
}
