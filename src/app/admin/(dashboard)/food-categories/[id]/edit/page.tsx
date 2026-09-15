import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FoodCategoryForm from "@/components/admin/FoodCategoryForm";

export default async function EditFoodCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await prisma.foodCategory.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa danh mục món ăn</h1>
      <FoodCategoryForm initial={category} />
    </div>
  );
}
