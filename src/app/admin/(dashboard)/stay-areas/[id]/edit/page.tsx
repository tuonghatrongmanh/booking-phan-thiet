import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StayAreaForm from "@/components/admin/StayAreaForm";

export default async function EditStayAreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const area = await prisma.stayArea.findUnique({ where: { label: id } });
  if (!area) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa khu vực</h1>
      <StayAreaForm initial={area} />
    </div>
  );
}
