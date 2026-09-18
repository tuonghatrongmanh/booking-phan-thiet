// Gửi cảnh báo tức thời qua Telegram khi có sự kiện bảo mật mức "high" - chủ động
// báo cho admin ngay trên điện thoại, không phải tự vào dashboard mới biết. Nếu chưa
// cấu hình TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID thì chỉ log cảnh báo, không throw.

import { rateLimit } from "@/lib/rate-limit";

export async function sendTelegramAlert(message: string): Promise<{ sent: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[telegram-alert] Chưa cấu hình TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID - không gửi được:", message);
    return { sent: false };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML" }),
    });
    if (!res.ok) {
      console.error("[telegram-alert] Telegram trả về lỗi:", await res.text().catch(() => ""));
      return { sent: false };
    }
    return { sent: true };
  } catch (err) {
    console.error("[telegram-alert] Lỗi khi gọi Telegram API:", err);
    return { sent: false };
  }
}

// Giới hạn 1 cảnh báo / 10 phút cho MỖI IP - tránh spam Telegram nếu 1 nguồn lặp
// lại liên tục cùng 1 loại request nhạy cảm.
export function shouldAlertForIp(ip: string): boolean {
  return rateLimit(`telegram-alert:${ip}`, 1, 10 * 60_000);
}
