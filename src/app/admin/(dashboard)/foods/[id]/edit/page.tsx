import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import FoodForm from "@/components/admin/FoodForm";
import FoodImagesManager from "@/components/admin/FoodImagesManager";

export default async function EditFoodPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [food, categories, images] = await Promise.all([
    prisma.food.findUnique({ where: { id } }),
    prisma.foodCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.foodImage.findMany({ where: { foodId: id }, orderBy: { sortOrder: "asc" } }),
  ]);
  if (!food) notFound();

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa món ăn</h1>
      <FoodForm initial={food} categories={categories} />
      <FoodImagesManager foodId={food.id} images={images} />
    </div>
  );
}
