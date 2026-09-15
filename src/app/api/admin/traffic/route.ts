import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

type Range = "24h" | "7d" | "30d";

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysAgo(now: Date, days: number) {
  const d = startOfDay(now);
  d.setDate(d.getDate() - days);
  return d;
}

// GET /api/admin/traffic?range=24h|7d|30d - du lieu that cho bieu do luot truy cap,
// dung cho tab chuyen doi khong reload trang o dashboard.
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const range = (req.nextUrl.searchParams.get("range") as Range) || "24h";
  const now = new Date();

  if (range === "24h") {
    const today = startOfDay(now);
    const rows = await prisma.$queryRaw<{ bucket: number; visits: bigint; uniqueIps: bigint }[]>`
      SELECT EXTRACT(HOUR FROM "createdAt")::int as bucket, COUNT(*) as visits, COUNT(DISTINCT ip) as "uniqueIps"
      FROM "RequestLog" WHERE "createdAt" >= ${today}
      GROUP BY bucket ORDER BY bucket ASC
    `;
    const data = Array.from({ length: 24 }, (_, h) => {
      const r = rows.find((x) => Number(x.bucket) === h);
      return { label: `${String(h).padStart(2, "0")}h`, visits: r ? Number(r.visits) : 0, uniqueIps: r ? Number(r.uniqueIps) : 0 };
    });
    return NextResponse.json({ data });
  }

  const days = range === "30d" ? 30 : 7;
  const start = daysAgo(now, days - 1);

  const rows = await prisma.$queryRaw<{ bucket: string; visits: bigint; uniqueIps: bigint }[]>`
    SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') as bucket, COUNT(*) as visits, COUNT(DISTINCT ip) as "uniqueIps"
    FROM "RequestLog" WHERE "createdAt" >= ${start}
    GROUP BY bucket ORDER BY bucket ASC
  `;

  const data = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const r = rows.find((x) => x.bucket === key);
    data.push({
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      visits: r ? Number(r.visits) : 0,
      uniqueIps: r ? Number(r.uniqueIps) : 0,
    });
  }
  return NextResponse.json({ data });
}
