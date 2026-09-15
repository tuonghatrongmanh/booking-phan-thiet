import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";

// GET /api/sale-standing/me - tinh trang dinh chi/cam HIEN CO HIEU LUC cua Sale dang
// dang nhap (null neu khong co gi hoac da het han/da tam tat). Dung cho popup bat
// buoc o trang tai khoan/toan site.
export async function GET() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") return NextResponse.json(null);

  const place = await prisma.place.findUnique({ where: { userId: actor.id } });
  if (!place) return NextResponse.json(null);

  const standing = await prisma.saleStanding.findUnique({ where: { placeId: place.id } });
  if (!standing || !standing.active) return NextResponse.json(null);

  // Dinh chi da het han thi coi nhu khong con hieu luc (khong can cron, tinh luc doc)
  if (standing.action === "SUSPENDED" && standing.suspendedUntil && standing.suspendedUntil.getTime() < Date.now()) {
    return NextResponse.json(null);
  }

  return NextResponse.json(standing);
}
