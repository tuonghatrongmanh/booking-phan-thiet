import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PopupForm from "@/components/admin/PopupForm";

export default async function EditPopupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const popup = await prisma.popup.findUnique({ where: { id } });
  if (!popup) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa pop-up</h1>
      <PopupForm initial={popup} />
    </div>
  );
}
