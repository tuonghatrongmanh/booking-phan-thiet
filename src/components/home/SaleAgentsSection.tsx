import Image from "next/image";
import Link from "next/link";
import T from "@/lib/i18n/T";
import SaleRankBadge from "@/components/sale/SaleRankBadge";

export type SaleAgent = {
  id: string;
  name: string;
  avatar: string | null;
  coverImage: string | null;
  phone: string | null;
  zaloUrl: string | null;
  fanpageUrl: string | null;
  avgRating: number;
  reviewCount: number;
  salePoints: number;
};

export default function SaleAgentsSection({ agents }: { agents: SaleAgent[] }) {
  return (
    <section id="sale-uy-tin" className="container-custom py-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-800 flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2.5l7.5 3.2v5.4c0 5.2-3.2 8.9-7.5 10.4-4.3-1.5-7.5-5.2-7.5-10.4V5.7L12 2.5z" fill="#1ea34c" />
              <path d="M8.3 12.2l2.6 2.6 5-5.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <T id="section.sale.title">SALE UY TÍN TẠI PHAN THIẾT</T>
          </h2>
          <p className="text-sm text-slate-400 mt-0.5"><T id="section.sale.subtitle">Những đơn vị được đánh giá cao bởi cộng đồng du lịch</T></p>
        </div>
        <Link
          href="/sale"
          className="flex items-center gap-1 text-sm font-bold text-brand-blue border border-sky-200 rounded-full px-4 py-1.5 hover:bg-sky-50 transition-colors shrink-0"
        >
          <T id="common.viewAll">Xem tất cả</T>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-card p-8 text-center text-slate-400">
          Chưa có sale uy tín nào được đăng. Vào trang quản trị để thêm mới (danh mục &quot;Sale uy tín&quot;).
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto scrollbar-none snap-x snap-mandatory -mx-6 px-6 py-3 sm:mx-0 sm:px-0 sm:py-0 sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4 sm:gap-5">
          {agents.map((agent, i) => {
            const n = (i % 4) + 1;
            const bgImg = `/images/background_0${n}.png`;
            const avatarImg = `/images/avatar_0${n}.png`;
            return (
            <div
              key={agent.id}
              className="bg-white rounded-2xl shadow-card overflow-hidden hover-lift animate-fade-up shrink-0 w-[82%] snap-start sm:w-auto sm:shrink"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              {/* photo header */}
              <Link href={`/sale/${agent.id}`} className="block relative h-24 bg-gradient-to-br from-sky-200 to-blue-400">
                <Image src={agent.coverImage || bgImg} alt={agent.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                <span
                  className={
                    agent.avgRating >= 4.5
                      ? "absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-brand-green/95 px-2.5 py-1 rounded-full shadow"
                      : "absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-brand-blue/95 px-2.5 py-1 rounded-full shadow"
                  }
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  {agent.avgRating >= 4.5 ? "Uy tín cao" : "Uy tín"}
                </span>
              </Link>

              <div className="px-4 pb-4">
                <Link href={`/sale/${agent.id}`} className="flex items-center gap-3 mb-2.5">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-4 ring-white shadow-lg z-10 bg-brand-sky -mt-7">
                    <Image src={agent.avatar || avatarImg} alt={agent.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 pt-2">
                    <p className="font-bold text-[15px] text-slate-800 flex items-center gap-1.5 truncate">
                      {agent.name}
                      <span className="shrink-0 w-4 h-4 rounded-full bg-brand-blue flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-xs text-slate-400">Sale du lịch Phan Thiết</p>
                      <SaleRankBadge points={agent.salePoints} size="sm" />
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-1 mb-3 text-xs">
                  <span className="text-brand-gold flex">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg key={s} width="12" height="12" viewBox="0 0 24 24" fill="currentColor" opacity={s < Math.round(agent.avgRating) ? 1 : 0.3}>
                        <path d="M12 2l2.9 6 6.6.9-4.8 4.6 1.1 6.5L12 16.9 6.2 20l1.1-6.5L2.5 8.9l6.6-.9L12 2z" />
                      </svg>
                    ))}
                  </span>
                  <span className="font-bold text-slate-700">{agent.avgRating.toFixed(1)}</span>
                  <span className="text-slate-400">({agent.reviewCount})</span>
                </div>

                <div className="flex items-center gap-1.5 mb-3">
                  <a href={`tel:${agent.phone}`} className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.24 8.6 8.6 0 0 0 2.7.43 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A16 16 0 0 1 3 6a1 1 0 0 1 1-1h3.6a1 1 0 0 1 1 1 8.6 8.6 0 0 0 .43 2.7 1 1 0 0 1-.25 1l-2.2 2.2z" />
                    </svg>
                  </a>
                  <span className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 2a1 1 0 0 0-1 1c0 2.2-1.8 4-4 4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1c1.5 0 2.9-.5 4-1.3V15a4 4 0 1 1-4-4 1 1 0 0 0-1-1H2a1 1 0 0 0-1 1c0 3.9 3.1 7 7 7s7-3.1 7-7V9.7c1.1.8 2.5 1.3 4 1.3a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1c-2.2 0-4-1.8-4-4a1 1 0 0 0-1-1H9z" />
                    </svg>
                  </span>
                  <a href={agent.fanpageUrl || "#"} className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-slate-100 transition-colors">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
                    </svg>
                  </a>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="6" width="18" height="14" rx="2" />
                      <circle cx="12" cy="13" r="3.5" />
                      <path d="M8 6l1.5-2h5L16 6" />
                    </svg>
                    {agent.reviewCount} đánh giá
                  </span>
                  <Link href={`/sale/${agent.id}`} className="w-7 h-7 rounded-full border border-brand-green/40 text-brand-green flex items-center justify-center hover:bg-brand-greenBg transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
