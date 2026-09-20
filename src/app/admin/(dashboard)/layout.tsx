import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/current-admin";
import AdminShell from "@/components/admin/AdminShell";
import { getSectionPermission, type AdminPermissions } from "@/lib/admin-permissions";
import { firstAccessibleHref, isSuperOnlyPath, sectionForPath } from "@/lib/admin-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  // Tài khoản bị vô hiệu hóa / đã xóa: phiên JWT cũ vẫn còn hiệu lực, nên phải chặn ở đây.
  if (!admin || !admin.active) redirect("/admin/login");

  const permissions = admin.permissions as AdminPermissions | null;
  if (admin.role !== "SUPER_ADMIN") {
    const pathname = (await headers()).get("x-admin-pathname") ?? "";
    const section = sectionForPath(pathname);
    const blocked = isSuperOnlyPath(pathname) || (section !== null && !getSectionPermission(permissions, section).access);
    if (blocked) redirect(firstAccessibleHref((s) => getSectionPermission(permissions, s).access));
  }

  return (
    <AdminShell userName={admin.name} role={admin.role} permissions={permissions}>
      {children}
    </AdminShell>
  );
}
