import { NextResponse } from "next/server";
import { getIndexNowKey } from "@/lib/indexnow";

// Được truy cập qua rewrite /<key>.txt (xem next.config.ts) - công cụ tìm kiếm tải file
// này để xác minh site thật sự do chủ domain quản lý trước khi nhận URL từ IndexNow.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const expected = getIndexNowKey();
  if (!expected || key !== expected) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(expected, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
