import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { parseSheetUrl } from "@/lib/sheet-sync";

const createSchema = z.object({
  name: z.string().trim().min(2),
  sheetUrl: z.string().trim().min(10),
  sheetNamePattern: z.string().trim().min(1).optional(),
});

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const sources = await prisma.sheetSyncSource.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { mappings: true } } },
  });
  return NextResponse.json({ items: sources });
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Thông tin không hợp lệ" }, { status: 400 });

  const parsedUrl = parseSheetUrl(parsed.data.sheetUrl);
  if (!parsedUrl) {
    return NextResponse.json({ error: "Không đọc được ID từ link Google Sheets/Drive này" }, { status: 400 });
  }

  const source = await prisma.sheetSyncSource.create({
    data: {
      name: parsed.data.name,
      sheetId: parsedUrl.sheetId,
      ...(parsed.data.sheetNamePattern ? { sheetNamePattern: parsed.data.sheetNamePattern } : {}),
    },
  });
  return NextResponse.json(source, { status: 201 });
}
