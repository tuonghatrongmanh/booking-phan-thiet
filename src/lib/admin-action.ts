import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Admin } from "@prisma/client";
import { getSectionPermission, type AdminPermissions, type SectionKey } from "@/lib/admin-permissions";

// Lay Admin day du (khong chi thong tin trong JWT) tu session hien tai - can query lai
// vi permissions/active co the da bi SuperAdmin doi sau luc dang nhap, JWT khong tu cap
// nhat kip. Dung o dau moi API route can kiem tra quyen chi tiet (khac requireAdmin()
// cu chi kiem tra "co phai admin khong", khong biet quyen chi tiet tung muc).
export async function requireAdminSession() {
  const session = await auth();
  const isAdmin = (session?.user as { type?: string } | undefined)?.type === "admin";
  if (!session?.user || !isAdmin) {
    return { admin: null as Admin | null, error: NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 }) };
  }
  const adminId = (session.user as { id: string }).id;
  const admin = await prisma.admin.findUnique({ where: { id: adminId } });
  if (!admin || !admin.active) {
    return { admin: null as Admin | null, error: NextResponse.json({ error: "Tài khoản đã bị đình chỉ hoặc không tồn tại" }, { status: 403 }) };
  }
  return { admin, error: null as NextResponse | null };
}

function permsOf(admin: Admin): AdminPermissions | null {
  return (admin.permissions as AdminPermissions | null) ?? null;
}

// Kiem tra quyen truy cap CA MUC (vd staff khong duoc vao Sale uy tin luon) - dung dau
// cac trang/API GET cua 1 section.
export async function requireSectionAccess(section: SectionKey) {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) return { admin: null as Admin | null, error: error! };
  if (admin.role === "SUPER_ADMIN") return { admin, error: null as NextResponse | null };
  const perm = getSectionPermission(permsOf(admin), section);
  if (!perm.access) {
    return { admin: null as Admin | null, error: NextResponse.json({ error: "Bạn không có quyền truy cập mục này" }, { status: 403 }) };
  }
  return { admin, error: null as NextResponse | null };
}

// Dung truoc khi tao/sua (POST/PATCH thuong) - chi tra ve loi neu khong co quyen,
// khong co khai niem "cho duyet" o day (create/edit luon la "co" hoac "khong", rieng
// truong hop can duyet nhu sua LuuTruPageSettings dung requestUpdate() rieng ben duoi).
export function requireCreateOrEdit(admin: Admin, section: SectionKey, action: "create" | "edit"): NextResponse | null {
  if (admin.role === "SUPER_ADMIN") return null;
  const perm = getSectionPermission(permsOf(admin), section);
  const mode = action === "create" ? perm.create : perm.edit;
  if (mode === "none" || mode === "approval") {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 });
  }
  return null;
}

type QueueResult =
  | { outcome: "blocked"; response: NextResponse }
  | { outcome: "queued"; response: NextResponse }
  | { outcome: "direct" };

// Dung cho DELETE/an (hide) - co 3 kha nang: khong co quyen (blocked), co quyen lam
// ngay (direct - caller tu thuc hien tiep), hoac can duyet (queued - tu tao san
// PendingChange va tra loi luon, caller KHONG lam gi them, chi return response nay).
export async function requestDeleteOrHide(params: {
  admin: Admin;
  section: SectionKey;
  action: "delete" | "hide";
  targetType: string;
  targetId: string;
  targetLabel: string;
  ownerId?: string | null;
}): Promise<QueueResult> {
  const { admin, section, action, targetType, targetId, targetLabel, ownerId } = params;
  if (admin.role === "SUPER_ADMIN") return { outcome: "direct" };

  const perm = getSectionPermission(permsOf(admin), section);
  let mode = action === "delete" ? perm.delete : perm.hide;

  if (mode === "own") mode = ownerId && ownerId === admin.id ? "direct" : "none";

  if (mode === "none") {
    return {
      outcome: "blocked",
      response: NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 }),
    };
  }
  if (mode === "direct") return { outcome: "direct" };

  await prisma.pendingChange.create({
    data: {
      requestedById: admin.id,
      action: action === "delete" ? "DELETE" : "HIDE",
      targetType,
      targetId,
      targetLabel,
    },
  });
  return {
    outcome: "queued",
    response: NextResponse.json(
      { queued: true, message: "Đã gửi yêu cầu, chờ quản trị viên cấp cao duyệt." },
      { status: 202 }
    ),
  };
}

// Dung cho cac UPDATE luon can duyet (vd LuuTruPageSettings) - khac requestDeleteOrHide
// vi luon tao PendingChange (khong co nhanh "direct"), va CO payload (de xuat thay doi).
export async function requestUpdate(params: {
  admin: Admin;
  section: SectionKey;
  targetType: string;
  targetId: string;
  targetLabel: string;
  payload: Record<string, unknown>;
}): Promise<QueueResult> {
  const { admin, section, targetType, targetId, targetLabel, payload } = params;
  if (admin.role === "SUPER_ADMIN") return { outcome: "direct" };

  const perm = getSectionPermission(permsOf(admin), section);
  if (perm.edit === "none") {
    return {
      outcome: "blocked",
      response: NextResponse.json({ error: "Bạn không có quyền thực hiện hành động này" }, { status: 403 }),
    };
  }
  if (perm.edit === "direct") return { outcome: "direct" };

  await prisma.pendingChange.create({
    data: {
      requestedById: admin.id,
      action: "UPDATE",
      targetType,
      targetId,
      targetLabel,
      payload: JSON.parse(JSON.stringify(payload)),
    },
  });
  return {
    outcome: "queued",
    response: NextResponse.json(
      { queued: true, message: "Đã gửi yêu cầu, chờ quản trị viên cấp cao duyệt." },
      { status: 202 }
    ),
  };
}
