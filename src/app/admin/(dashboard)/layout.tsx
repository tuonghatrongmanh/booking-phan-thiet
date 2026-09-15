import { getCurrentAdmin } from "@/lib/current-admin";
import AdminShell from "@/components/admin/AdminShell";
import type { AdminPermissions } from "@/lib/admin-permissions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();

  return (
    <AdminShell
      userName={admin?.name}
      role={admin?.role}
      permissions={admin ? (admin.permissions as AdminPermissions | null) : null}
    >
      {children}
    </AdminShell>
  );
}
