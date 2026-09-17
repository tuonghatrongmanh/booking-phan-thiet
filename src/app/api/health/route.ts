import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/health - để Render (hoặc bất kỳ uptime monitor nào) ping định kỳ. Kiểm
// tra kết nối DB thực sự (không chỉ "process còn sống") - Neon có thể bị cold-start
// hoặc mất kết nối tạm thời, lúc đó healthcheck sẽ báo 503 trước khi khách hàng thực
// sự gặp lỗi.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", time: new Date().toISOString() });
  } catch (err) {
    console.error("[health] DB check thất bại:", err);
    return NextResponse.json({ status: "error", time: new Date().toISOString() }, { status: 503 });
  }
}
