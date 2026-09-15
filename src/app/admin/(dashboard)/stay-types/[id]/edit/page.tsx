import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StayTypeSettingForm from "@/components/admin/StayTypeSettingForm";

export default async function EditStayTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const type = await prisma.stayTypeSetting.findUnique({ where: { id } });
  if (!type) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa danh mục chỗ ở</h1>
      <StayTypeSettingForm initial={type} />
    </div>
  );
}
