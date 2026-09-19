import ArticleSectionTitle from "@/components/news/ArticleSectionTitle";

type ReviewItem = { id: string; reviewerName: string; reviewerAvatar: string | null; rating: number; content: string };

export default function PlaceReviews({ reviews, placeName }: { reviews: ReviewItem[]; placeName: string }) {
  if (reviews.length === 0) return null;

  return (
    <div>
      <ArticleSectionTitle icon="fa-solid fa-users">Đánh giá từ du khách về {placeName}</ArticleSectionTitle>
      <div className="grid sm:grid-cols-3 gap-4">
        {reviews.map((r) => (
          <div key={r.id} className="bg-food-light rounded-2xl p-4">
            <div className="flex text-food-rating text-sm mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <i key={i} className={i < r.rating ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
              ))}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed line-clamp-4 mb-3">&quot;{r.content}&quot;</p>
            <p className="text-xs font-bold text-food-text">{r.reviewerName}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
