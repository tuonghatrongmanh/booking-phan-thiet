import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { rateLimit } from "@/lib/rate-limit";

// Chong brute-force dang nhap: gioi han theo EMAIL (khong phai IP) vi day la cach
// chan dung dich - ke tan cong doi IP van khong the thu lai ngay tren CUNG 1 tai
// khoan. 5 lan sai / 5 phut la du rong cho nguoi go nham, du chat de chan do quet.
const LOGIN_ATTEMPT_LIMIT = 5;
const LOGIN_WINDOW_MS = 5 * 60_000;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    // Đăng nhập Google lần đầu: tạo tài khoản User mới (lấy tên/ảnh từ Google, chưa có
    // SĐT/ngày sinh — người dùng bổ sung sau ở trang hồ sơ). Lần sau: liên kết theo email.
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      // Ưu tiên tìm theo googleId trước (đúng định danh nhất cho các lần đăng nhập lại).
      const googleEmail = user.email.toLowerCase();
      let dbUser = await prisma.user.findUnique({ where: { googleId: account.providerAccountId } });
      if (!dbUser) dbUser = await prisma.user.findUnique({ where: { email: googleEmail } });

      if (!dbUser) {
        try {
          dbUser = await prisma.user.create({
            data: {
              name: user.name || "Người dùng Google",
              email: googleEmail,
              googleId: account.providerAccountId,
              avatar: user.image || "/images/avatar-world.png",
            },
          });
        } catch {
          // Race condition: 2 request đăng nhập cùng lúc đã tạo tài khoản trước — lấy lại bản ghi đó thay vì lỗi.
          dbUser = await prisma.user.findUnique({ where: { googleId: account.providerAccountId } });
          if (!dbUser) return false;
        }
      } else if (!dbUser.googleId) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { googleId: account.providerAccountId },
        });
      }

      if (dbUser.hidden) return false;

      user.id = dbUser.id;
      (user as { type?: string }).type = "user";
      return true;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // prompt=select_account: bat Google LUON hien man hinh chon tai khoan, khong
      // tu dong dang nhap lai bang tai khoan Google gan nhat con "nho" trong trinh
      // duyet - nguoi dung co nhieu tai khoan Google moi chon duoc dung tai khoan muon.
      authorization: { params: { prompt: "select_account" } },
    }),
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        if (!rateLimit(`login-admin:${email.toLowerCase()}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS)) return null;

        const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } });
        if (!admin || !admin.active) return null;

        const valid = await bcrypt.compare(password, admin.password);
        if (!valid) return null;

        void prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } }).catch(() => {});

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
          type: "admin",
        };
      },
    }),
    Credentials({
      id: "user-credentials",
      name: "user-credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mật khẩu", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;
        if (!rateLimit(`login-user:${email.toLowerCase()}`, LOGIN_ATTEMPT_LIMIT, LOGIN_WINDOW_MS)) return null;

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        if (user.hidden) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
          type: "user",
        };
      },
    }),
  ],
});
