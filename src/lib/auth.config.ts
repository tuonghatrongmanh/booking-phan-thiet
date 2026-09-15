import type { NextAuthConfig } from "next-auth";

// File này KHÔNG được import prisma/bcrypt, vì nó có thể được bundle vào
// Edge Runtime (middleware) tùy phiên bản Next.js. Chỉ chứa cấu hình thuần túy.
export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  providers: [], // Provider thật (Credentials + Prisma) chỉ khai báo trong lib/auth.ts
  callbacks: {
    // Gắn role/type vào token + session ngay tại đây (không chỉ trong lib/auth.ts) vì
    // proxy.ts dùng authConfig độc lập — nếu chỉ khai báo ở lib/auth.ts, field "type"
    // sẽ bị thiếu khi proxy giải mã JWT, khiến authorized() luôn coi là chưa đăng nhập.
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
        token.type = (user as { type?: string }).type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string; role?: string; type?: string }).id = token.id as string;
        (session.user as { id?: string; role?: string; type?: string }).role = token.role as string;
        (session.user as { id?: string; role?: string; type?: string }).type = token.type as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isAdminArea = pathname.startsWith("/admin") && pathname !== "/admin/login";
      const isAdminSession = (auth?.user as { type?: string } | undefined)?.type === "admin";

      if (isAdminArea && !isAdminSession) {
        return false; // NextAuth tự động redirect sang pages.signIn kèm callbackUrl
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
