import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BrandLogoForm from "@/components/admin/BrandLogoForm";

export default async function EditBrandLogoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const logo = await prisma.brandLogo.findUnique({ where: { id } });
  if (!logo) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa logo thương hiệu</h1>
      <BrandLogoForm initial={logo} />
    </div>
  );
}
