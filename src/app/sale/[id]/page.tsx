import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ScrollCarousel from "@/components/home/ScrollCarousel";

export const dynamic = "force-dynamic";

const FALLBACK_COVER = "/images/background_01.png";
const FALLBACK_AVATAR = "/images/avatar_01.png";
const MAX_ROWS_SHOWN = 6;

type Params = { params: Promise<{ id: string }> };

function avgOf(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function timeAgo(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Hôm nay";
  if (days === 1) return "1 ngày trước";
  if (days < 7) return `${days} ngày trước`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} tuần trước`;
  const months = Math.floor(days / 30);
  return `${months} tháng trước`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const place = await prisma.place.findUnique({ where: { id } });
  if (!place || place.category !== "SALE" || place.hidden) return {};
  return {
    title: `${place.name} | Sale uy tín Phan Thiết`,
    description: place.slogan || place.description || undefined,
  };
}

const SOCIAL_LINKS = [
  { key: "zaloUrl" as const, icon: "fa-solid fa-comment-dots", label: "Zalo" },
  { key: "fanpageUrl" as const, icon: "fa-brands fa-facebook-f", label: "Facebook" },
  { key: "tiktokUrl" as const, icon: "fa-brands fa-tiktok", label: "TikTok" },
  { key: "youtubeUrl" as const, icon: "fa-brands fa-youtube", label: "YouTube" },
  { key: "instagramUrl" as const, icon: "fa-brands fa-instagram", label: "Instagram" },
];

export default async function SaleAgentDetailPage({ params }: Params) {
  const { id } = await params;
  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      reviews: { select: { rating: true } },
      videos: { orderBy: { sortOrder: "asc" }, take: MAX_ROWS_SHOWN },
      socialComments: { orderBy: { createdAt: "desc" }, take: MAX_ROWS_SHOWN },
    },
  });
  if (!place || place.category !== "SALE" || place.hidden) notFound();

  const ratingAverage = avgOf(place.reviews.map((r) => r.rating));
  const ratingTotal = place.reviews.length;
  const verified = place.status === "TRUSTED";

  return (
    <>
      <Header />

      <div className="bg-slate-50 min-h-screen py-6 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Card 1: hero + identity + contact + stats, fused as one card */}
          <div className="bg-white rounded-3xl shadow-card overflow-hidden mb-5">
            <div className="relative w-full h-40 sm:h-52 bg-slate-200">
              <Image
                src={place.coverImage || FALLBACK_COVER}
                alt={place.name}
                fill
                sizes="(min-width: 1024px) 900px, 100vw"
                priority
                className="object-cover"
              />
              <div className="absolute top-4 right-5 text-right text-white/90 font-display italic text-sm sm:text-base leading-tight drop-shadow hidden sm:block">
                Phan Thiết –<br />Mũi Né ♡
              </div>
            </div>

            <div className="relative px-5 sm:px-8">
              <div className="absolute -top-10 sm:-top-14 left-5 sm:left-8 w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white shadow-lg bg-white shrink-0">
                <Image src={place.avatar || FALLBACK_AVATAR} alt={place.name} fill className="object-cover" />
              </div>

              <div className="pt-2 sm:pt-3 pl-24 sm:pl-32 pb-4 sm:pb-5 min-h-[3rem]">
                <p className="font-display font-bold text-lg sm:text-2xl text-slate-800 flex items-center gap-2 flex-wrap">
                  {place.name}
                  {verified && (
                    <span className="shrink-0 w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </p>
                {place.roleTitle && <p className="text-xs sm:text-base text-slate-500 mt-0.5">{place.roleTitle}</p>}
              </div>
            </div>

            {place.slogan && (
              <p className="px-5 sm:px-8 -mt-2 pb-4 text-xs sm:text-sm text-slate-400 italic">&ldquo;{place.slogan}&rdquo;</p>
            )}

            <div className="border-t border-slate-100 px-5 sm:px-8 py-4 sm:py-5">
              <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
                {place.phone && (
                  <div>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <i className="fa-solid fa-phone text-brand-blue text-sm" aria-hidden="true" />
                      {place.phone}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">Liên hệ trực tiếp (Zalo/Call)</p>
                  </div>
                )}

                <div className="flex items-center gap-4 sm:gap-5 flex-wrap">
                  {place.phone && (
                    <a href={`tel:${place.phone}`} className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-blue transition">
                      <span className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                        <i className="fa-solid fa-phone text-sm" aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-semibold">Gọi ngay</span>
                    </a>
                  )}
                  {SOCIAL_LINKS.map((s) => {
                    const url = place[s.key];
                    if (!url) return null;
                    return (
                      <a
                        key={s.key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 text-slate-500 hover:text-brand-blue transition"
                      >
                        <span className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
                          <i className={`${s.icon} text-sm`} aria-hidden="true" />
                        </span>
                        <span className="text-[11px] font-semibold">{s.label}</span>
                      </a>
                    );
                  })}
                </div>

                {verified && (
                  <div className="flex items-center gap-1.5 bg-brand-sky/40 text-brand-blue text-xs sm:text-sm font-bold px-3 py-2 rounded-xl shrink-0">
                    <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                    <span>
                      Đã xác thực
                      <span className="hidden sm:inline"> — Saler uy tín đã được Admin xác nhận</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border-t border-slate-100 pt-4">
                <div>
                  <p className="font-display font-bold text-lg text-slate-800 flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-star text-brand-gold text-sm" aria-hidden="true" /> {ratingAverage.toFixed(1)}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Đánh giá ({ratingTotal})</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-slate-800 flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-users text-brand-blue text-sm" aria-hidden="true" />
                    {place.clientsServedCount != null ? place.clientsServedCount.toLocaleString("vi-VN") : "—"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Khách hàng đã tư vấn</p>
                </div>
                <div>
                  <p className="font-display font-bold text-lg text-slate-800 flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-calendar-check text-brand-green text-sm" aria-hidden="true" />
                    {place.yearsExperience ?? "—"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Năm kinh nghiệm</p>
                </div>
                <div>
                  <p className="font-display font-bold text-sm sm:text-base text-slate-800 flex items-center justify-center gap-1.5">
                    <i className="fa-solid fa-location-dot text-brand-red text-sm" aria-hidden="true" />
                    {place.workArea || "Phan Thiết"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Khu vực hoạt động</p>
                </div>
              </div>
            </div>
          </div>

          {place.description && (
            <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 mb-5">
              <p className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-user text-brand-blue" aria-hidden="true" /> Về tôi
              </p>
              <p className="text-sm text-slate-500 whitespace-pre-line leading-relaxed">{place.description}</p>
            </div>
          )}

          {place.videos.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 mb-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-slate-700 flex items-center gap-2">
                  <i className="fa-brands fa-tiktok text-slate-700" aria-hidden="true" /> Video review &amp; chia sẻ từ mình
                </p>
                {place.tiktokUrl && (
                  <a href={place.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-blue hover:underline shrink-0">
                    Xem kênh TikTok <i className="fa-solid fa-chevron-right text-[10px]" aria-hidden="true" />
                  </a>
                )}
              </div>
              <ScrollCarousel showLeftArrow>
                {place.videos.map((v) => (
                  <a
                    key={v.id}
                    href={v.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 w-36 sm:w-40 snap-start rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg transition"
                  >
                    <div className="relative w-full aspect-[9/16] bg-slate-100">
                      {v.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={v.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                          <i className="fa-brands fa-tiktok text-3xl" aria-hidden="true" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
                          <i className="fa-solid fa-play text-white text-xs" aria-hidden="true" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold text-white bg-black/50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <i className="fa-brands fa-tiktok" aria-hidden="true" /> {timeAgo(v.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 p-2 line-clamp-2 leading-snug">{v.title || "Xem video"}</p>
                  </a>
                ))}
              </ScrollCarousel>
            </div>
          )}

          {place.socialComments.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
              <p className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-comment-dots text-brand-blue" aria-hidden="true" /> Khách hàng nói gì về mình
              </p>
              <ScrollCarousel showLeftArrow>
                {place.socialComments.map((c) => (
                  <div key={c.id} className="shrink-0 w-40 sm:w-44 snap-start rounded-xl overflow-hidden border border-slate-100">
                    <div className="relative w-full aspect-[4/5] bg-slate-100">
                      <Image src={c.imageUrl} alt="" fill sizes="180px" className="object-cover" />
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="text-xs font-semibold text-slate-600 truncate">
                        {c.authorName || "Khách hàng"} <span className="text-slate-300">·</span>{" "}
                        {c.platform === "ZALO" ? "Zalo" : c.platform === "FACEBOOK" ? "Facebook" : c.platform === "TIKTOK" ? "TikTok" : c.platform === "INSTAGRAM" ? "Instagram" : "Khác"}
                      </p>
                      <p className="text-[11px] text-slate-400">{timeAgo(c.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </ScrollCarousel>
            </div>
          )}

          <div className="text-center mt-6">
            <Link href="/sale" className="text-sm font-semibold text-slate-400 hover:text-brand-blue transition">
              <i className="fa-solid fa-arrow-left mr-1.5" aria-hidden="true" /> Xem tất cả Sale uy tín
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
