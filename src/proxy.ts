import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { isSuperOnlyPath } from "@/lib/admin-nav";

// Next.js 16: file "proxy.ts" thay thế "middleware.ts", chạy trên Node.js runtime.
// Dùng authConfig (không có Prisma/bcrypt) để việc bảo vệ route luôn nhẹ và an toàn.
// Ngoài việc bắt đăng nhập (callback authorized), còn:
//  - chặn nhân viên (EDITOR) vào các trang chỉ dành cho SuperAdmin, kể cả khi gõ thẳng URL
//    hoặc điều hướng mềm (layout không chạy lại ở điều hướng mềm, proxy thì có);
//  - truyền đường dẫn hiện tại xuống layout qua header nội bộ để layout kiểm tra quyền theo mục.
export const proxy = NextAuth(authConfig).auth((req) => {
  const { pathname } = req.nextUrl;
  const user = req.auth?.user as { role?: string; type?: string } | undefined;
  // Khi bọc auth((req) => ...), callback authorized KHÔNG tự chuyển hướng nữa nên phải tự
  // chặn người chưa đăng nhập (hoặc không phải tài khoản admin) ở đây.
  if (pathname !== "/admin/login" && user?.type !== "admin") {
    const loginUrl = new URL("/admin/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  const role = user?.role;
  if (role && role !== "SUPER_ADMIN" && isSuperOnlyPath(pathname)) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-admin-pathname", pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
});

export const config = {
  matcher: ["/admin/:path*"],
};
