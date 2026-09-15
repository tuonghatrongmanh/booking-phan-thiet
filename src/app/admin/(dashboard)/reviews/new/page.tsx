import { prisma } from "@/lib/prisma";
import ReviewForm from "@/components/admin/ReviewForm";

export default async function NewReviewPage() {
  const places = await prisma.place.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Thêm đánh giá</h1>
      <ReviewForm places={places} />
    </div>
  );
}
