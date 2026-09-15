import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import NewsForm from "@/components/admin/NewsForm";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [news, places] = await Promise.all([
    prisma.news.findUnique({ where: { id } }),
    prisma.place.findMany({ select: { id: true, name: true, category: true }, orderBy: { name: "asc" } }),
  ]);
  if (!news) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa bài viết</h1>
      <NewsForm initial={news} places={places} />
    </div>
  );
}
