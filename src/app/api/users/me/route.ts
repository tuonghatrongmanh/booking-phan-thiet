import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileEditSchema } from "@/lib/validation";

const EDIT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

async function requireUser() {
  const session = await auth();
  const isUser = (session?.user as { type?: string } | undefined)?.type === "user";
  if (!session?.user || !isUser) {
    return { userId: null, error: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  }
  return { userId: (session.user as { id: string }).id, error: null };
}

export async function GET() {
  const { userId, error } = await requireUser();
  if (error) return error;

  const user = await prisma.user.findUnique({ where: { id: userId! } });
  if (!user) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });

  const { password: _password, ...safe } = user;
  void _password;
  return NextResponse.json(safe);
}

export async function PATCH(req: Request) {
  const { userId, error } = await requireUser();
  if (error) return error;

  const user = await prisma.user.findUnique({ where: { id: userId! } });
  if (!user) return NextResponse.json({ error: "Không tìm thấy tài khoản" }, { status: 404 });

  if (user.lastEditedAt) {
    const elapsed = Date.now() - user.lastEditedAt.getTime();
    if (elapsed < EDIT_COOLDOWN_MS) {
      const daysLeft = Math.ceil((EDIT_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
      return NextResponse.json(
        { error: `Bạn chỉ có thể chỉnh sửa thông tin sau ${daysLeft} ngày nữa` },
        { status: 429 }
      );
    }
  }

  const body = await req.json().catch(() => null);
  const parsed = profileEditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { name, phone, email, dob, avatar } = parsed.data;

  const conflict = await prisma.user.findFirst({
    where: { AND: [{ id: { not: userId! } }, { OR: [{ email }, { phone }] } ] },
  });
  if (conflict) {
    return NextResponse.json(
      { error: conflict.email === email ? "Email đã được sử dụng" : "Số điện thoại đã được sử dụng" },
      { status: 409 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId! },
    data: { name, phone, email, dob: new Date(dob), avatar: avatar || user.avatar, lastEditedAt: new Date() },
  });

  const { password: _password, ...safe } = updated;
  void _password;
  return NextResponse.json(safe);
}
