import type { Server as SocketIOServer } from "socket.io";

// server.ts (custom server) gan io vao day luc khoi dong; cac API route dung getIO()
// de phat su kien realtime. Dung globalThis giong pattern cua prisma.ts de tranh tao
// nhieu instance khi hot-reload trong dev.
const globalForIO = globalThis as unknown as { io: SocketIOServer | undefined };

export function setIO(io: SocketIOServer) {
  globalForIO.io = io;
}

// Co the tra ve undefined neu route chay ngoai custom server (vi du luc "next build"
// type-check) - noi goi phai dung optional chaining, khong duoc coi day la loi.
export function getIO(): SocketIOServer | undefined {
  return globalForIO.io;
}
