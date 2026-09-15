import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Next.js 16: file "proxy.ts" thay thế "middleware.ts", chạy trên Node.js runtime.
// Dùng authConfig (không có Prisma/bcrypt) để việc bảo vệ route luôn nhẹ và an toàn.
export const proxy = NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
