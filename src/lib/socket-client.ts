"use client";

import { io, type Socket } from "socket.io-client";

// Dung globalThis (khong phai bien module-level thuong) de singleton nay song sot qua
// Fast Refresh trong dev: neu chi dung "let socket" o module scope, moi lan Turbopack
// HMR nap lai file nay (rat de xay ra vi hau het component forum deu import file nay)
// bien se bi reset ve undefined trong khi cac component CHUA re-render van con giu
// tham chieu socket CU (voi listener con dang hoat dong) -> ket noi moi duoc tao them
// ma ket noi cu khong bi dong, server phat 1 su kien nhung client nhan duoc 2 lan qua
// 2 ket noi khac nhau (gay loi trung key trong danh sach bai viet). Pattern nay giong
// het cach prisma.ts tranh tao nhieu PrismaClient khi hot-reload.
const globalForSocket = globalThis as unknown as { forumSocket: Socket | undefined };

export function getSocket(): Socket {
  if (!globalForSocket.forumSocket) {
    globalForSocket.forumSocket = io({ path: "/socket.io", autoConnect: true });
  }
  return globalForSocket.forumSocket;
}
