import { prisma } from "@/lib/prisma";
import { avgOf } from "@/lib/places";
import type { PlaceCategory } from "@prisma/client";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import PlaceCard from "./PlaceCard";

// Trang danh muc san pham dung chung cho "Luu tru" (HOMESTAY) va "Am thuc" (RESTAURANT) -
// hien danh sach dia diem (Place) da co san trong he thong (dung chung du lieu voi trang chu).
export default async function PlaceCatalog({
  category,
  basePath,
  title,
  description,
  icon,
  q,
}: {
  category: PlaceCategory;
  basePath: string;
  title: string;
  description: string;
  icon: string;
  q?: string;
}) {
  const places = await prisma.place.findMany({
    where: {
      category,
      ...(q ? { name: { contains: q } } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      images: { take: 1, orderBy: { id: "asc" }, select: { url: true } },
      reviews: { select: { rating: true } },
      _count: { select: { reviews: true } },
    },
  });

  const cards = places.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    address: p.address,
    status: p.status,
    coverImage: p.images[0]?.url ?? null,
    avgRating: avgOf(p.reviews.map((r) => r.rating)),
    reviewCount: p._count.reviews,
    featuredRank: p.featuredRank,
  }));

  // Ghim theo featuredRank (superAdmin uu tien) truoc, con lai xep theo danh gia cao nhat -
  // giong dung cach getFeaturedPlaces() dang lam o forum-data.ts.
  cards.sort((a, b) => {
    if (a.featuredRank != null && b.featuredRank != null) return a.featuredRank - b.featuredRank;
    if (a.featuredRank != null) return -1;
    if (b.featuredRank != null) return 1;
    return b.avgRating - a.avgRating;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <section className="bg-navbar-gradient py-10">
        <div className="container-custom">
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-3">
            <i className={icon} aria-hidden="true" /> {title}
          </h1>
          <p className="text-white/80 text-sm mt-1.5 max-w-xl">{description}</p>

          <form action={basePath} className="flex items-center gap-2 bg-white rounded-full shadow-card px-4 py-2.5 mt-5 max-w-md">
            <i className="fa-solid fa-magnifying-glass text-slate-400 text-sm" aria-hidden="true" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
              className="flex-1 min-w-0 text-sm focus:outline-none"
            />
          </form>
        </div>
      </section>

      <section className="container-custom py-8">
        {cards.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-10 text-center text-slate-400">
            {q ? `Không tìm thấy kết quả cho "${q}".` : "Chưa có địa điểm nào trong danh mục này."}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((place) => (
              <PlaceCard key={place.id} place={place} basePath={basePath} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
