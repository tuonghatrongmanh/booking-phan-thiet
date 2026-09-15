import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession, requireCreateOrEdit } from "@/lib/admin-action";
import { z } from "zod";

const guideVideoSchema = z.object({
  title: z.string().trim().min(1),
  videoUrl: z.string().trim().regex(/^[A-Za-z0-9_-]{6,20}$/, "Video ID không hợp lệ"),
  caption: z.string().trim().optional(),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional().default(true),
});

// GET /api/guide-videos?active=true
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const activeParam = searchParams.get("active");

  const videos = await prisma.guideVideo.findMany({
    where: activeParam !== null ? { active: activeParam === "true" } : {},
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return error!;
  const permError = requireCreateOrEdit(admin, "guide-videos", "create");
  if (permError) return permError;

  const body = await req.json();
  const parsed = guideVideoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const video = await prisma.guideVideo.create({ data: parsed.data });
  return NextResponse.json(video, { status: 201 });
}
