import { prisma } from "@/lib/prisma";
import Header from "@/components/home/Header";
import Hero from "@/components/home/Hero";
import FeatureCards from "@/components/home/FeatureCards";
import CategorySection from "@/components/home/CategorySection";
import SaleAgentsSection, { type SaleAgent } from "@/components/home/SaleAgentsSection";
import SaleSection from "@/components/home/SaleSection";
import NewsSection from "@/components/home/NewsSection";
import ReviewSection from "@/components/home/ReviewSection";
import CTASection from "@/components/home/CTASection";
import TrustedBrandsSection from "@/components/home/TrustedBrandsSection";
import Footer from "@/components/home/Footer";
import ScrollTopButton from "@/components/home/ScrollTopButton";
import Reveal from "@/components/home/Reveal";

// Trang chủ luôn lấy dữ liệu mới nhất từ database (sale, tin tức, đánh giá)
export const dynamic = "force-dynamic";

function avgOf(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default async function HomePage() {
  const [sales, news, reviews, saleAgentPlaces, categoryCounts, reviewAgg, reviewsByStar] = await Promise.all([
    prisma.sale.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { place: { select: { name: true } }, images: true },
    }),
    prisma.place.findMany({
      where: { category: "SALE" },
      orderBy: [{ salePoints: "desc" }, { createdAt: "desc" }],
      take: 5,
      include: {
        reviews: { select: { rating: true } },
        images: { take: 1, orderBy: { id: "asc" }, select: { url: true } },
      },
    }),
    Promise.all([
      prisma.place.count({ where: { category: "HOMESTAY" } }),
      prisma.place.count({ where: { category: "CAR_RENTAL" } }),
      prisma.place.count({ where: { category: "RESTAURANT" } }),
      prisma.place.count({ where: { category: "ATTRACTION" } }),
    ]),
    prisma.review.aggregate({ _avg: { rating: true }, _count: true }),
    prisma.review.groupBy({ by: ["rating"], _count: true }),
  ]);

  const saleAgents: SaleAgent[] = saleAgentPlaces.map((p) => ({
    id: p.id,
    name: p.name,
    avatar: p.avatar,
    coverImage: p.coverImage ?? p.images[0]?.url ?? null,
    phone: p.phone,
    zaloUrl: p.zaloUrl,
    fanpageUrl: p.fanpageUrl,
    avgRating: avgOf(p.reviews.map((r) => r.rating)),
    reviewCount: p.reviews.length,
    salePoints: p.salePoints,
  }));

  const [homestay, carRental, restaurant, attraction] = categoryCounts;

  const starCounts = [5, 4, 3, 2, 1].map(
    (star) => reviewsByStar.find((r) => r.rating === star)?._count ?? 0
  );
  const reviewStats = {
    average: reviewAgg._avg.rating ?? 0,
    total: reviewAgg._count,
    starCounts,
  };

  return (
    <>
      <Header />
      <Hero />
      <Reveal><FeatureCards /></Reveal>
      <Reveal><CategorySection counts={{ homestay, carRental, restaurant, attraction }} /></Reveal>
      <Reveal><SaleAgentsSection agents={saleAgents} /></Reveal>
      <Reveal><SaleSection sales={sales} /></Reveal>
      <Reveal><NewsSection news={news} /></Reveal>
      <Reveal><ReviewSection reviews={reviews} stats={reviewStats} /></Reveal>
      <Reveal><TrustedBrandsSection /></Reveal>
      <Reveal><CTASection /></Reveal>
      <Footer />
      <ScrollTopButton />
    </>
  );
}
