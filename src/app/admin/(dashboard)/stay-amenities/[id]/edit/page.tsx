import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import StayAmenityForm from "@/components/admin/StayAmenityForm";

export default async function EditStayAmenityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const amenity = await prisma.stayAmenity.findUnique({ where: { label: id } });
  if (!amenity) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa tiện ích</h1>
      <StayAmenityForm initial={amenity} />
    </div>
  );
}
