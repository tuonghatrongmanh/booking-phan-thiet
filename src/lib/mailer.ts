// Lớp gửi email dùng chung (quên mật khẩu, xác thực email...). Nếu chưa cấu hình
// RESEND_API_KEY thì KHÔNG thể gửi thực sự - lúc đó hàm này chỉ log cảnh báo và trả
// về sent:false, các nơi gọi phải có phương án dự phòng (vd: trang quản trị "Yêu cầu
// đặt lại mật khẩu" cho admin xử lý tay), không được làm vỡ luồng hoặc giả vờ đã gửi.
// Dùng fetch thẳng tới REST API của Resend (không cần thêm npm package riêng).

type SendMailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendMail({ to, subject, html }: SendMailInput): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM || "Booking Phan Thiet <onboarding@resend.dev>";

  if (!apiKey) {
    console.warn(`[mailer] RESEND_API_KEY chưa được cấu hình - không gửi được email tới ${to} (subject: "${subject}")`);
    return { sent: false, reason: "not_configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[mailer] Resend trả về lỗi ${res.status} khi gửi tới ${to}: ${body}`);
      return { sent: false, reason: "provider_error" };
    }

    return { sent: true };
  } catch (err) {
    console.error(`[mailer] Lỗi khi gọi Resend API:`, err);
    return { sent: false, reason: "network_error" };
  }
}
