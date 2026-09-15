import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import LocalSpecialtyForm from "@/components/admin/LocalSpecialtyForm";

export default async function EditLocalSpecialtyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await prisma.localSpecialty.findUnique({ where: { id } });
  if (!item) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa đặc sản</h1>
      <LocalSpecialtyForm initial={item} />
    </div>
  );
}
