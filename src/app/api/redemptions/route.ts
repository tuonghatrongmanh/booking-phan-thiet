import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";

// GET /api/redemptions - "Lich su quy doi" cua chinh nguoi dung dang dang nhap.
export async function GET() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  const redemptions = await prisma.redemption.findMany({
    where: { userId: actor.id },
    include: { reward: { select: { name: true, image: true, category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items: redemptions });
}
