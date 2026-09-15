import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 10;

// GET /api/admin/security-logs?severity=&endpoint=&ip=&page= - danh sach canh bao
// bat thuong that, co loc + phan trang, dung cho SecurityAlertTable (client-side,
// khong reload trang khi doi bo loc).
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const severity = sp.get("severity");
  const endpoint = sp.get("endpoint");
  const ip = sp.get("ip")?.trim();
  const page = Math.max(1, Number(sp.get("page")) || 1);

  const where: Prisma.RequestLogWhereInput = { suspicious: true };
  if (severity && severity !== "all") where.severity = severity;
  if (endpoint && endpoint !== "all") where.path = { contains: endpoint, mode: "insensitive" };
  if (ip) where.ip = { contains: ip, mode: "insensitive" };

  const [total, logs] = await Promise.all([
    prisma.requestLog.count({ where }),
    prisma.requestLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return NextResponse.json({ logs, total, totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)), page });
}
