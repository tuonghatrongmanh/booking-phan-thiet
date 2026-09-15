import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuideVideoForm from "@/components/admin/GuideVideoForm";

export default async function EditGuideVideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.guideVideo.findUnique({ where: { id } });
  if (!video) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa video hướng dẫn</h1>
      <GuideVideoForm initial={video} />
    </div>
  );
}
