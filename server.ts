import { createServer } from "http";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { setIO } from "./src/lib/socket-server";

// Custom server: bat buoc phai co de giu duoc ket noi Socket.io lau dai (WebSocket)
// cho tinh nang realtime cua dien dan - Next.js mac dinh (next dev/next start) khong
// giu duoc long-lived connection kieu nay. Xem node_modules/next/dist/docs/01-app/02-guides/custom-server.md
const port = parseInt(process.env.PORT || "3000", 10);
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, turbopack: dev });
const handle = app.getRequestHandler();

// Chi cho phep join cac phong dung quy uoc "forum:<slug>" / "forum-post:<id>",
// gioi han do dai de tranh 1 client spam join vo so ten phong tuy y.
const ROOM_RE = /^forum(-post)?:[a-zA-Z0-9_-]{1,80}$/;

// Log ro loi truoc khi thoat - Node.js KHONG tu exit nua neu co listener rieng cho
// "uncaughtException" (khac hanh vi mac dinh), nen phai goi process.exit() tay, neu
// khong process se tiep tuc chay voi trang thai khong ro rang (nguy hiem hon la de
// no crash that). unhandledRejection thi chi log, khong exit - 1 promise reject rieng
// le (vd 1 query Prisma bi cold-start timeout) khong nen keo sap toan bo server.
process.on("uncaughtException", (err) => {
  console.error("[uncaughtException]", err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error("[unhandledRejection]", reason);
});

app.prepare().then(async () => {
  // Import dong (khong phai import tinh o dau file) - request-log.ts import prisma.ts,
  // ma prisma.ts khoi tao PrismaClient ngay luc module duoc nap dung process.env.DATABASE_URL.
  // Import tinh o dau file se chay TRUOC ca dong "next({dev})" (import luon duoc hoisting
  // len dau, chay truoc moi code khac trong file) - luc do Next.js chua kip nap .env,
  // gay loi "Cannot read properties of undefined (reading 'prepareCacheLength')". Doi
  // toi sau app.prepare() (Next da nap .env xong) moi import moi an toan.
  const { shouldLogPath, getClientIp, logRequest, isIpBlocked, initBlockedIpsWatcher } = await import("./src/lib/request-log");
  const { getToken } = await import("next-auth/jwt");
  await initBlockedIpsWatcher();

  // Dong bo trang thai con/het phong-xe tu Google Sheets moi 10 phut 1 lan - chi anh
  // huong cac Place da duoc admin anh xa toi 1 dong cu the (xem /admin/sheet-sync).
  // Chay ngam, khong chan request nao - loi (VD thieu API key, sheet bi thu hoi quyen
  // xem) duoc ghi lai vao SheetSyncSource.lastSyncError de admin tu thay tren giao dien.
  const { syncAllSheetSources } = await import("./src/lib/sheet-sync");
  const SHEET_SYNC_INTERVAL_MS = 10 * 60 * 1000;
  setInterval(() => {
    void syncAllSheetSources();
  }, SHEET_SYNC_INTERVAL_MS);

  const httpServer = createServer((req, res) => {
    const pathname = (req.url || "/").split("?")[0];
    const ip = getClientIp(req.headers, req.socket.remoteAddress);

    if (isIpBlocked(ip)) {
      res.statusCode = 403;
      res.end("Forbidden");
      return;
    }

    if (shouldLogPath(pathname)) {
      const start = Date.now();
      // Giai ma cookie session (JWT, khong can Prisma) NGAY luc request toi, truoc khi
      // Next.js xu ly xong - de biet request nay co phai tu 1 phien admin dang nhap hay
      // khong. Muc dich: khi admin xem "Canh bao bao mat", ho phan biet duoc luu luong
      // CUA CHINH MINH (co adminEmail) voi luu luong an danh (co the la tan cong THAT),
      // tranh bam "Chan IP" nham vao chinh minh.
      const tokenPromise = getToken({
        req: { headers: { cookie: req.headers.cookie ?? "" } },
        secret: process.env.NEXTAUTH_SECRET,
        secureCookie: !dev,
      }).catch(() => null);

      res.on("finish", () => {
        void (async () => {
          const token = await tokenPromise;
          const isAdminSession = (token as { type?: string } | null)?.type === "admin";
          const admin = isAdminSession
            ? { email: (token as { email?: string | null }).email ?? null, name: (token as { name?: string | null }).name ?? null }
            : null;

          void logRequest({
            ip,
            path: pathname,
            method: req.method || "GET",
            userAgent: (req.headers["user-agent"] as string) || null,
            durationMs: Date.now() - start,
            statusCode: res.statusCode,
            admin,
          });
        })();
      });
    }
    handle(req, res);
  });

  const io = new SocketIOServer(httpServer, { path: "/socket.io" });

  io.on("connection", (socket) => {
    socket.on("join", (room: unknown) => {
      if (typeof room === "string" && ROOM_RE.test(room)) socket.join(room);
    });
    socket.on("leave", (room: unknown) => {
      if (typeof room === "string" && ROOM_RE.test(room)) socket.leave(room);
    });
  });

  setIO(io);

  httpServer.listen(port, () => {
    console.log(
      `> Server (Socket.io realtime) san sang tai http://localhost:${port} (${dev ? "development" : process.env.NODE_ENV})`
    );
  });
});
