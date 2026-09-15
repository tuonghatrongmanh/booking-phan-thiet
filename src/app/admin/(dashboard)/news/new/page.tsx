import { prisma } from "@/lib/prisma";
import NewsForm from "@/components/admin/NewsForm";

export default async function NewNewsPage() {
  const places = await prisma.place.findMany({ select: { id: true, name: true, category: true }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Đăng bài viết mới</h1>
      <NewsForm places={places} />
    </div>
  );
}
