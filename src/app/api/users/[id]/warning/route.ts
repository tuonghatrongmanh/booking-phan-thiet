import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { z } from "zod";

const schema = z.object({ note: z.string().min(1).max(1000) });

// POST - admin ghi canh cao kem ghi chu, luu thoi diem canh cao (khac null = dang
// hien thi "!" do o avatar cua nguoi dung do tren toan site).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { warningNote: parsed.data.note, warnedAt: new Date() },
    });
    const { password: _password, ...safe } = user;
    void _password;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}

// DELETE - go canh cao (admin xac nhan da xu ly xong)
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const user = await prisma.user.update({ where: { id }, data: { warningNote: null, warnedAt: null } });
    const { password: _password, ...safe } = user;
    void _password;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }
}
