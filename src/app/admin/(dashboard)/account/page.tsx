import { requireAdminSession } from "@/lib/admin-action";
import { redirect } from "next/navigation";
import AdminAccountForm from "@/components/admin/AdminAccountForm";

export const dynamic = "force-dynamic";

export default async function AdminAccountPage() {
  const { admin, error } = await requireAdminSession();
  if (error || !admin) redirect("/admin/login");

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Tài khoản của tôi</h1>
        <p className="text-slate-400">Cập nhật thông tin và mật khẩu cho tài khoản quản trị của bạn</p>
      </div>

      <AdminAccountForm name={admin.name} email={admin.email} />
    </div>
  );
}
