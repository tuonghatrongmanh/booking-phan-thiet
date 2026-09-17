import { prisma } from "@/lib/prisma";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import SaleAgentsSection, { type SaleAgent } from "@/components/home/SaleAgentsSection";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sale uy tín tại Phan Thiết",
  description: "Danh sách các Sale uy tín được cộng đồng du lịch Phan Thiết đánh giá cao.",
};

function avgOf(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default async function SaleAgentsListingPage() {
  const places = await prisma.place.findMany({
    where: { category: "SALE", hidden: false },
    orderBy: [{ salePoints: "desc" }, { createdAt: "desc" }],
    include: {
      reviews: { select: { rating: true } },
      images: { take: 1, orderBy: { id: "asc" }, select: { url: true } },
    },
  });

  const agents: SaleAgent[] = places.map((p) => ({
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

  return (
    <>
      <Header />
      <div className="pt-6">
        <SaleAgentsSection agents={agents} />
      </div>
      <Footer />
    </>
  );
}
