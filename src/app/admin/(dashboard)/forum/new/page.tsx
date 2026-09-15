import AdminForumPostForm from "@/components/admin/AdminForumPostForm";

export default function AdminForumNewPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Đăng bài mới trong diễn đàn</h1>
      <AdminForumPostForm />
    </div>
  );
}
