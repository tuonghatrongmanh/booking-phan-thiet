import { prisma } from "@/lib/prisma";
import FoodForm from "@/components/admin/FoodForm";

export default async function NewFoodPage() {
  const categories = await prisma.foodCategory.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Thêm món ăn mới</h1>
      <FoodForm categories={categories} />
    </div>
  );
}
