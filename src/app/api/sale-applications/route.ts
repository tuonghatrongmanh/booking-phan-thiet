import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActor } from "@/lib/auth-actor";
import { requireSectionAccess } from "@/lib/admin-action";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const createSchema = z.object({
  fullName: z.string().trim().min(3, "Vui lòng nhập họ và tên đầy đủ").max(80),
  reason: z.string().trim().min(20, "Vui lòng viết lý do chi tiết hơn (ít nhất 20 ký tự)"),
  dob: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Ngày sinh không hợp lệ"),
  phone: z.string().trim().min(8, "Số điện thoại không hợp lệ"),
  tiktokUrl: z.string().trim().nullable().optional(),
  images: z.array(z.string().trim().min(1)).min(3, "Cần tối thiểu 3 ảnh minh chứng").max(5, "Tối đa 5 ảnh minh chứng"),
});

// GET /api/sale-applications?status= - danh sach don dang ky (chi admin)
export async function GET(req: NextRequest) {
  const { error } = await requireSectionAccess("sale-agents");
  if (error) return error;

  const status = req.nextUrl.searchParams.get("status");
  const where = status && status !== "all" ? { status: status as never } : {};

  const applications = await prisma.saleApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { user: { select: { name: true, email: true, phone: true } }, images: true },
  });
  return NextResponse.json(applications);
}

// POST /api/sale-applications - nguoi dung dang ky tro thanh Sale uy tin
export async function POST(req: NextRequest) {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  }

  if (!rateLimit(`sale-application:${actor.id}`, 3, 60_000)) {
    return NextResponse.json({ error: "Bạn gửi yêu cầu quá nhanh, vui lòng thử lại sau." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const pending = await prisma.saleApplication.findFirst({ where: { userId: actor.id, status: "PENDING" } });
  if (pending) {
    return NextResponse.json({ error: "Bạn đã có một đơn đăng ký đang chờ duyệt" }, { status: 400 });
  }

  const application = await prisma.saleApplication.create({
    data: {
      userId: actor.id,
      fullName: parsed.data.fullName,
      reason: parsed.data.reason,
      dob: new Date(parsed.data.dob),
      phone: parsed.data.phone,
      tiktokUrl: parsed.data.tiktokUrl || null,
      images: { create: parsed.data.images.map((url) => ({ url })) },
    },
  });

  return NextResponse.json(application, { status: 201 });
}
