import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/admin/ReviewForm";

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { images: true, place: { select: { name: true } } },
  });
  if (!review) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa đánh giá</h1>
      <ReviewForm
        initial={{
          id: review.id,
          placeName: review.place.name,
          reviewerName: review.reviewerName,
          reviewerAvatar: review.reviewerAvatar,
          rating: review.rating,
          content: review.content,
          trustLabel: review.trustLabel,
          likes: review.likes,
          images: review.images,
        }}
      />
    </div>
  );
}
