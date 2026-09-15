import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BannerForm from "@/components/admin/BannerForm";

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const banner = await prisma.ctaBanner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa banner</h1>
      <BannerForm initial={banner} />
    </div>
  );
}
