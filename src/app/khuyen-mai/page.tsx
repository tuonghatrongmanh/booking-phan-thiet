import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import PromotionCard from "@/components/home/PromotionCard";
import Pagination from "@/components/places/Pagination";
import { prisma } from "@/lib/prisma";
import { buildPageMetadata } from "@/lib/page-seo";
import { startOfToday } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildPageMetadata("/khuyen-mai");
}

const PAGE_SIZE = 9;

const CATEGORY_LABEL: Record<string, string> = {
  HOMESTAY: "Homestay & Villa",
  CAR_RENTAL: "Thuê xe",
  RESTAURANT: "Quán ăn",
  ATTRACTION: "Điểm tham quan",
  SALE: "Dịch vụ khác",
};

export default async function KhuyenMaiPage({ searchParams }: { searchParams: Promise<{ page?: string; category?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const category = sp.category && CATEGORY_LABEL[sp.category] ? sp.category : "ALL";

  // Chỉ hiện chương trình đang bật và chưa hết hạn
  const where = {
    active: true,
    OR: [{ endDate: null }, { endDate: { gte: startOfToday() } }],
    ...(category !== "ALL" ? { category: category as keyof typeof CATEGORY_LABEL as never } : {}),
  };

  const [total, sales, groups] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.sale.groupBy({ by: ["category"], where: { active: true }, _count: { _all: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const href = (p: number, c: string = category) => `/khuyen-mai?${new URLSearchParams({ ...(c !== "ALL" ? { category: c } : {}), page: String(p) }).toString()}`;

  const chipCls = (active: boolean) =>
    `shrink-0 px-4 py-2 rounded-full text-sm font-bold transition ${active ? "bg-brand-blue text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-brand-blue hover:text-brand-blue"}`;

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <section className="bg-hero-gradient">
        <div className="container-custom py-10 sm:py-14">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-footer">Khuyến mãi hot tại Phan Thiết</h1>
          <p className="text-slate-600 mt-2 max-w-2xl">Ưu đãi hấp dẫn từ homestay, villa, thuê xe, quán ăn và điểm tham quan - cập nhật thường xuyên.</p>
        </div>
      </section>

      <main className="container-custom py-8 sm:py-10">
        <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5 sm:mx-0 sm:px-0 sm:flex-wrap mb-6">
          <Link href={href(1, "ALL")} className={chipCls(category === "ALL")}>Tất cả</Link>
          {groups.map((g) => (
            <Link key={g.category} href={href(1, g.category)} className={chipCls(category === g.category)}>
              {CATEGORY_LABEL[g.category] ?? g.category}
            </Link>
          ))}
        </div>

        {sales.length === 0 ? (
          <p className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-500">Hiện chưa có chương trình khuyến mãi nào trong mục này.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {sales.map((sale, i) => (
              <PromotionCard key={sale.id} sale={sale} priority={i < 3} className="h-[240px] sm:h-[260px]" />
            ))}
          </div>
        )}

        <div className="mt-8">
          <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => href(p)} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
