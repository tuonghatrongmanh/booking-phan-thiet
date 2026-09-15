import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SaleForm from "@/components/admin/SaleForm";

export default async function EditSalePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sale = await prisma.sale.findUnique({ where: { id } });
  if (!sale) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa chương trình sale</h1>
      <SaleForm initial={sale} />
    </div>
  );
}
