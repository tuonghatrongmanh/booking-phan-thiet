import FoodCategoryForm from "@/components/admin/FoodCategoryForm";

export default function NewFoodCategoryPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Thêm danh mục món ăn</h1>
      <FoodCategoryForm />
    </div>
  );
}
