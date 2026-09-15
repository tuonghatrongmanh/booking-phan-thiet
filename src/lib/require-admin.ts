import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Dùng ở đầu các API route cần quyền admin (POST/PATCH/DELETE)
export async function requireAdmin() {
  const session = await auth();
  const isAdmin = (session?.user as { type?: string } | undefined)?.type === "admin";
  if (!session?.user || !isAdmin) {
    return {
      session: null,
      error: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }),
    };
  }
  return { session, error: null };
}
