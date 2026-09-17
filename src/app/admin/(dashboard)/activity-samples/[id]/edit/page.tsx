import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ActivitySampleForm from "@/components/admin/ActivitySampleForm";

export default async function EditActivitySamplePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.activitySample.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa mục minh họa</h1>
      <ActivitySampleForm initial={item} />
    </div>
  );
}
