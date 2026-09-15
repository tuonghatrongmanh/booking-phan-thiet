import NewStaffForm from "@/components/admin/NewStaffForm";

export default function NewStaffPage() {
  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800">Thêm nhân viên</h1>
        <p className="text-slate-400">Tài khoản mới sẽ dùng bộ quyền mặc định, bạn có thể chỉnh sau khi tạo</p>
      </div>
      <NewStaffForm />
    </div>
  );
}
