import { getCurrentAdmin } from "@/lib/current-admin";
import { getSectionPermission, type AdminPermissions } from "@/lib/admin-permissions";
import BookingCalendar from "@/components/admin/BookingCalendar";

export const dynamic = "force-dynamic";

export default async function BookingCalendarPage({ searchParams }: { searchParams: Promise<{ month?: string; type?: string }> }) {
  const sp = await searchParams;
  const admin = await getCurrentAdmin();
  const perms = admin?.permissions as AdminPermissions | null | undefined;
  const canCar = admin?.role === "SUPER_ADMIN" || getSectionPermission(perms, "car-rentals").access;
  const type: "stay" | "car" = sp.type === "car" && canCar ? "car" : "stay";
  return <BookingCalendar basePath="/admin/lich-dat" type={type} monthParam={sp.month} allowedTypes={canCar ? ["stay", "car"] : ["stay"]} />;
}
