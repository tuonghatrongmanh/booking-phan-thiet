import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { z } from "zod";

const schema = z.object({ ip: z.string().min(1), reason: z.string().optional() });

// POST - chan 1 IP (server.ts doc lai cache moi 30s va tra ve 403 ngay tu tang HTTP,
// khong de lot vao Next.js/API routes).
export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const blocked = await prisma.blockedIp.upsert({
    where: { ip: parsed.data.ip },
    create: { ip: parsed.data.ip, reason: parsed.data.reason },
    update: { reason: parsed.data.reason },
  });
  return NextResponse.json(blocked, { status: 201 });
}

// DELETE ?ip=... - go chan
export async function DELETE(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const ip = req.nextUrl.searchParams.get("ip");
  if (!ip) return NextResponse.json({ error: "Thiếu IP" }, { status: 400 });

  await prisma.blockedIp.delete({ where: { ip } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
