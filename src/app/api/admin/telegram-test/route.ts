import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-action";
import { sendTelegramAlert } from "@/lib/telegram-alert";

// GET: cho biết Telegram đã được cấu hình trên server này chưa (KHÔNG lộ giá trị token).
export async function GET() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  return NextResponse.json({
    hasToken: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    hasChatId: Boolean(process.env.TELEGRAM_CHAT_ID),
  });
}

// POST /api/admin/telegram-test - gửi 1 tin thử để chủ web kiểm tra cảnh báo Telegram đang
// chạy được trên SERVER THẬT (biến môi trường phải được đặt trong Render, không chỉ trong
// file .env trên máy). Chỉ SUPER_ADMIN.
export async function POST() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  if (admin.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Chỉ SuperAdmin mới gửi thử được" }, { status: 403 });
  }

  const missing = [
    ...(process.env.TELEGRAM_BOT_TOKEN ? [] : ["TELEGRAM_BOT_TOKEN"]),
    ...(process.env.TELEGRAM_CHAT_ID ? [] : ["TELEGRAM_CHAT_ID"]),
  ];
  if (missing.length > 0) {
    return NextResponse.json(
      { sent: false, error: `Server chưa có biến môi trường: ${missing.join(", ")}. Hãy thêm vào Render → Environment rồi đợi deploy lại.` },
      { status: 200 }
    );
  }

  const result = await sendTelegramAlert("✅ <b>Booking Phan Thiết</b>: tin nhắn thử từ trang Cài đặt. Cảnh báo Telegram đang hoạt động trên web thật.");
  if (!result.sent) {
    return NextResponse.json({
      sent: false,
      error: "Có cấu hình nhưng Telegram từ chối gửi. Kiểm tra lại token và chat id (và bạn đã bấm Start với bot chưa).",
    });
  }
  return NextResponse.json({ sent: true });
}
