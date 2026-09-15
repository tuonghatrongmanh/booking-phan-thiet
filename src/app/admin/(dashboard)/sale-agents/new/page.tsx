import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/current-admin";
import { getSectionPermission } from "@/lib/admin-permissions";
import PlaceForm from "@/components/admin/PlaceForm";

export default async function NewSaleAgentPage() {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin && currentAdmin.role !== "SUPER_ADMIN") {
    const perm = getSectionPermission(currentAdmin.permissions as never, "sale-agents");
    if (!perm.access) redirect("/admin/news");
  }

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Thêm Sale uy tín</h1>
      <PlaceForm lockCategory="SALE" />
    </div>
  );
}
