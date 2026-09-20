import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSuperAdmin } from "@/lib/admin-action";
import { logAdminAction } from "@/lib/audit-log";
import { applyPartnerChange } from "@/lib/partner";

const schema = z.object({ action: z.enum(["approve", "reject"]), note: z.string().trim().max(500).optional() });

// PATCH /api/admin/partner-requests/:id { action, note } - duyệt (áp dụng thay đổi vào địa điểm) hoặc từ chối yêu cầu của đối tác.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { admin, error } = await requireSuperAdmin();
  if (error || !admin) return error!;
  const { id } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const change = await prisma.placeChangeRequest.findUnique({ where: { id }, include: { place: { select: { name: true } } } });
  if (!change) return NextResponse.json({ error: "Không tìm thấy yêu cầu" }, { status: 404 });
  if (change.status !== "PENDING") return NextResponse.json({ error: "Yêu cầu này đã được xử lý" }, { status: 400 });

  if (parsed.data.action === "approve") {
    try {
      await applyPartnerChange(change.placeId, change.payload);
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Không áp dụng được thay đổi" }, { status: 400 });
    }
  }
  const updated = await prisma.placeChangeRequest.update({
    where: { id },
    data: { status: parsed.data.action === "approve" ? "APPROVED" : "REJECTED", adminNote: parsed.data.note || null, reviewedAt: new Date(), reviewedById: admin.id },
  });
  void logAdminAction(admin, `partner-request-${parsed.data.action}`, "PlaceChangeRequest", id, `${change.place.name}${parsed.data.note ? ` - ${parsed.data.note}` : ""}`);
  return NextResponse.json(updated);
}
