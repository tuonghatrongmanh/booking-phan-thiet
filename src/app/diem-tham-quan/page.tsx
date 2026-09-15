import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import { prisma } from "@/lib/prisma";
import AttractionCard from "@/components/places-detail/AttractionCard";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trải nghiệm & Điểm tham quan Phan Thiết | Booking Phan Thiết",
  description: "Khám phá các điểm tham quan, trải nghiệm hấp dẫn tại Phan Thiết - Mũi Né: đồi cát, suối tiên, hải đăng, làng chài, di tích lịch sử...",
};

export default async function AttractionsListPage() {
  const attractions = await prisma.place.findMany({
    where: { category: "ATTRACTION", hidden: false },
    orderBy: { createdAt: "desc" },
    include: { reviews: { select: { rating: true } }, placeReviews: { select: { rating: true } } },
  });

  const cards = attractions.map((a) => {
    const hasRealReviews = a.placeReviews.length > 0;
    const ratingAverage = hasRealReviews
      ? a.placeReviews.reduce((s, r) => s + r.rating, 0) / a.placeReviews.length
      : a.reviews.length > 0
        ? a.reviews.reduce((s, r) => s + r.rating, 0) / a.reviews.length
        : 0;
    const ratingTotal = hasRealReviews ? a.placeReviews.length : a.reviews.length;
    return {
      id: a.id,
      name: a.name,
      description: a.description,
      avatar: a.avatar,
      address: a.address,
      ratingAverage,
      ratingTotal,
    };
  });

  return (
    <div className="bg-food-bg min-h-screen">
      <Header />

      <section className="bg-brand-sky/40 py-10">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <h1 className="font-display font-bold text-3xl text-slate-800 mb-2">Trải nghiệm &amp; Điểm tham quan Phan Thiết</h1>
          <p className="text-slate-500 text-sm">
            Khám phá những hoạt động và địa điểm hấp dẫn không thể bỏ lỡ khi đến Phan Thiết - Mũi Né
          </p>
        </div>
      </section>

      <Reveal>
        <section className="container-custom py-10">
          {cards.length === 0 ? (
            <p className="text-center text-slate-400 py-16">Chưa có địa điểm tham quan nào.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {cards.map((c) => (
                <AttractionCard key={c.id} attraction={c} />
              ))}
            </div>
          )}
        </section>
      </Reveal>

      <Footer />
    </div>
  );
}
