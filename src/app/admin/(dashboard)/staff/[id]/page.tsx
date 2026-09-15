import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StaffPermissionsEditor from "@/components/admin/StaffPermissionsEditor";
import StaffActivityPanel from "@/components/admin/StaffActivityPanel";
import PasswordResetCard from "@/components/admin/PasswordResetCard";
import type { AdminPermissions } from "@/lib/admin-permissions";

type Params = { params: Promise<{ id: string }> };

export default async function StaffDetailPage({ params }: Params) {
  const { id } = await params;
  const staff = await prisma.admin.findUnique({ where: { id } });
  if (!staff || staff.role === "SUPER_ADMIN") notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">{staff.name}</h1>
        <p className="text-slate-400">{staff.email}</p>
      </div>

      <PasswordResetCard resetUrl={`/api/admin/staff/${staff.id}/reset-password`} label="nhân viên này" />

      <StaffActivityPanel staffId={staff.id} />

      <StaffPermissionsEditor staffId={staff.id} initialPermissions={(staff.permissions as AdminPermissions | null) ?? {}} />
    </div>
  );
}
