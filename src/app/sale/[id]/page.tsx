import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ScrollCarousel from "@/components/home/ScrollCarousel";
import SaleRankBadge from "@/components/sale/SaleRankBadge";
import SaleVideoGrid from "@/components/sale/SaleVideoGrid";
import SaleOwnerPanel from "@/components/sale/SaleOwnerPanel";
import { loadSaleReferral } from "@/lib/sale-referral-data";
import { getActor } from "@/lib/auth-actor";
import { computeSalePoints } from "@/lib/sale-points";
import { sumBonus, type SaleTaskStatus } from "@/lib/sale-tasks";
import { buildSaleStats, buildTrustFacts, nextRankInfo } from "@/lib/sale-profile-view";

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
  { key: "zaloUrl" as const, icon: "fa-solid fa-comment-dots", label: "Zalo", color: "bg-[#0068FF]" },
  { key: "fanpageUrl" as const, icon: "fa-brands fa-facebook-f", label: "Facebook", color: "bg-[#1877F2]" },
  { key: "tiktokUrl" as const, icon: "fa-brands fa-tiktok", label: "TikTok", color: "bg-slate-900" },
  { key: "youtubeUrl" as const, icon: "fa-brands fa-youtube", label: "YouTube", color: "bg-[#FF0000]" },
  { key: "instagramUrl" as const, icon: "fa-brands fa-instagram", label: "Instagram", color: "bg-[#C13584]" },
];

const PLATFORM_LABEL: Record<string, string> = { ZALO: "Zalo", FACEBOOK: "Facebook", TIKTOK: "TikTok", INSTAGRAM: "Instagram" };

export default async function SaleAgentDetailPage({ params }: Params) {
  const { id } = await params;
  const [place, latestReviews] = await Promise.all([
    prisma.place.findUnique({
      where: { id },
      include: {
        reviews: { select: { rating: true } },
        videos: { orderBy: { sortOrder: "asc" }, take: MAX_ROWS_SHOWN },
        socialComments: { orderBy: { createdAt: "desc" }, take: MAX_ROWS_SHOWN },
      },
    }),
    prisma.review.findMany({ where: { placeId: id }, orderBy: { createdAt: "desc" }, take: 6, include: { images: { take: 3 } } }),
  ]);
  if (!place || place.category !== "SALE" || place.hidden) notFound();

  // Chủ hồ sơ (Sale đang đăng nhập) thấy thêm "Khu vực của bạn" để sửa hồ sơ, thêm video, nhận nhiệm vụ...
  const actor = await getActor();
  const isOwner = actor?.type === "user" && place.userId === actor.id;
  const owner = isOwner
    ? await Promise.all([
        prisma.place.findUnique({
          where: { id },
          include: {
            videos: { orderBy: { sortOrder: "asc" } },
            socialComments: { orderBy: { createdAt: "desc" } },
            reviews: { select: { rating: true } },
            standing: { select: { action: true, active: true } },
            saleTasks: { orderBy: { createdAt: "desc" }, take: 30 },
          },
        }),
        prisma.guideVideo.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
        loadSaleReferral(id),
      ])
    : null;

  const ownerPoints = owner?.[0] ? computeSalePoints({ ...owner[0], bonusPoints: sumBonus(owner[0].saleTasks) }) : null;

  const ratingAverage = avgOf(place.reviews.map((r) => r.rating));
  const ratingTotal = place.reviews.length;
  const verified = place.status === "TRUSTED";
  const rankInfo = nextRankInfo(place.salePoints);
  const stats = buildSaleStats({
    ratingAverage,
    ratingTotal,
    clientsServedCount: place.clientsServedCount,
    yearsExperience: place.yearsExperience,
    workArea: place.workArea,
    videoCount: place.videos.length,
    createdAt: place.createdAt,
    now: new Date(),
  });
  const trustFacts = buildTrustFacts({
    verified,
    ratingAverage,
    ratingTotal,
    videoCount: place.videos.length,
    feedbackCount: place.socialComments.length,
    rankLabel: rankInfo.current.label,
    points: place.salePoints,
  });
  const socials = SOCIAL_LINKS.filter((s) => place[s.key]);
  const hasContact = Boolean(place.phone) || socials.length > 0;

  return (
    <>
      <Header />

      {/* Nền: dải màu thương hiệu phía trên + họa tiết logo Booking Phan Thiết lặp mờ toàn trang */}
      <div className="relative bg-[#eef4fc] bg-[url('/images/pattern-bpt.png')] bg-[length:520px_420px] min-h-screen pb-24 lg:pb-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-gradient-to-b from-brand-blue/12 via-brand-blue/5 to-transparent" aria-hidden="true" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          <nav className="text-[13px] text-slate-500 font-semibold flex items-center gap-1.5 mb-4 flex-wrap">
            <Link href="/" className="hover:text-brand-blue">Trang chủ</Link>
            <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
            <Link href="/sale" className="hover:text-brand-blue">Sale uy tín</Link>
            <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
            <span className="text-slate-700">{place.name}</span>
          </nav>

          {/* Thẻ danh tính */}
          <div className="bg-white rounded-3xl shadow-game-card overflow-hidden mb-5 ring-1 ring-brand-blue/10">
            <div className="relative w-full h-44 sm:h-60 bg-slate-200">
              <Image
                src={place.coverImage || FALLBACK_COVER}
                alt={place.name}
                fill
                sizes="(min-width: 1024px) 1000px, 100vw"
                priority
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-blueDark/55 via-transparent to-brand-blueDark/10" />
              <div className="absolute top-4 right-5 text-right text-white font-display italic text-sm sm:text-lg leading-tight drop-shadow hidden sm:block">
                Phan Thiết –<br />Mũi Né ♡
              </div>
              {isOwner && (
                <a href="#khu-vuc-cua-ban" className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 bg-white/95 text-brand-blue text-xs sm:text-sm font-bold px-3 py-2 rounded-full shadow hover:bg-white">
                  <i className="fa-solid fa-pen" aria-hidden="true" /> Sửa ảnh bìa &amp; hồ sơ
                </a>
              )}
              {verified && (
                <span className="absolute top-3 left-3 sm:top-4 sm:left-5 inline-flex items-center gap-1.5 bg-white/95 text-brand-blue text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full shadow">
                  <i className="fa-solid fa-shield-halved" aria-hidden="true" /> Sale uy tín đã xác thực
                </span>
              )}
            </div>

            <div className="relative px-5 sm:px-8 pb-5 sm:pb-6">
              <div className="absolute -top-12 sm:-top-16 left-5 sm:left-8 w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl bg-white">
                <Image src={place.avatar || FALLBACK_AVATAR} alt={place.name} fill sizes="128px" className="object-cover" />
              </div>

              <div className="pt-14 sm:pt-4 sm:pl-40 min-h-[4rem]">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-800">{place.name}</h1>
                  {verified && (
                    <span className="shrink-0 w-6 h-6 rounded-full bg-brand-blue flex items-center justify-center" title="Đã xác thực" aria-label="Đã xác thực">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                  <SaleRankBadge points={place.salePoints} size="md" />
                </div>
                {place.roleTitle && <p className="text-sm sm:text-base font-semibold text-brand-blue mt-1">{place.roleTitle}</p>}
                {place.slogan && <p className="text-sm text-slate-500 italic mt-1">&ldquo;{place.slogan}&rdquo;</p>}
              </div>

              <div className={`grid grid-cols-2 ${stats.length >= 5 ? "sm:grid-cols-3 lg:grid-cols-6" : "sm:grid-cols-4"} gap-3 mt-5`}>
                {stats.map((s) => (
                  <div key={s.key} className="rounded-2xl bg-brand-tint border border-brand-blueMid/60 px-3 py-3 text-center">
                    <p className="font-display font-bold text-lg text-slate-800 flex items-center justify-center gap-1.5 leading-tight">
                      <i className={`${s.icon} ${s.iconClass} text-sm`} aria-hidden="true" />
                      <span className="truncate">{s.value}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 leading-tight">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {owner && owner[0] && (
            <SaleOwnerPanel
              place={{
                avatar: owner[0].avatar,
                coverImage: owner[0].coverImage,
                name: owner[0].name,
                roleTitle: owner[0].roleTitle,
                slogan: owner[0].slogan,
                description: owner[0].description,
                phone: owner[0].phone,
                workArea: owner[0].workArea,
                yearsExperience: owner[0].yearsExperience,
                clientsServedCount: owner[0].clientsServedCount,
                zaloUrl: owner[0].zaloUrl,
                fanpageUrl: owner[0].fanpageUrl,
                tiktokUrl: owner[0].tiktokUrl,
                youtubeUrl: owner[0].youtubeUrl,
                instagramUrl: owner[0].instagramUrl,
              }}
              videos={owner[0].videos}
              testimonials={owner[0].socialComments}
              guideVideos={owner[1]}
              referral={owner[2]}
              points={ownerPoints!.points}
              // chỉ truyền dữ liệu thuần (mission có hàm check không đi qua ranh giới server -> client được)
              missions={ownerPoints!.missions.map((m) => ({ mission: { id: m.mission.id, title: m.mission.title, description: m.mission.description, points: m.mission.points }, done: m.done }))}
              tasks={owner[0].saleTasks.map((t) => ({ id: t.id, status: t.status as SaleTaskStatus, title: t.title, description: t.description, bonusPoints: t.bonusPoints, saleNote: t.saleNote, adminNote: t.adminNote }))}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_330px] gap-5 items-start">
            <div className="min-w-0 space-y-5">
              {place.description && (
                <section className="bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
                  <h2 className="font-display font-bold text-lg text-slate-800 mb-3 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-brand-sky text-brand-blue flex items-center justify-center text-sm">
                      <i className="fa-solid fa-user" aria-hidden="true" />
                    </span>
                    Về {place.name}
                  </h2>
                  <p className="text-[15px] text-slate-600 whitespace-pre-line leading-relaxed">{place.description}</p>
                </section>
              )}

              <section className="bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
                <h2 className="font-display font-bold text-lg text-slate-800 mb-3 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-full bg-brand-sky text-brand-blue flex items-center justify-center text-sm">
                    <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                  </span>
                  Vì sao có thể tin tưởng
                </h2>
                <ul className="space-y-2.5">
                  {trustFacts.map((f) => (
                    <li key={f.text} className="flex items-start gap-3 text-[15px] text-slate-600">
                      <span className="mt-0.5 w-7 h-7 shrink-0 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center text-xs">
                        <i className={f.icon} aria-hidden="true" />
                      </span>
                      <span className="leading-relaxed">{f.text}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {place.videos.length > 0 && (
                <section className="bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm">
                        <i className="fa-brands fa-tiktok" aria-hidden="true" />
                      </span>
                      Video review &amp; chia sẻ
                    </h2>
                    {place.tiktokUrl && (
                      <a href={place.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-blue hover:underline shrink-0">
                        Xem kênh <i className="fa-solid fa-chevron-right text-[10px]" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                  <SaleVideoGrid videos={place.videos.map((v) => ({ id: v.id, sourceUrl: v.sourceUrl, thumbnailUrl: v.thumbnailUrl, title: v.title, ago: timeAgo(v.createdAt) }))} />
                </section>
              )}

              {place.socialComments.length > 0 && (
                <section className="bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
                  <h2 className="font-display font-bold text-lg text-slate-800 mb-3 flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-brand-sky text-brand-blue flex items-center justify-center text-sm">
                      <i className="fa-solid fa-comment-dots" aria-hidden="true" />
                    </span>
                    Khách hàng nói gì về mình
                  </h2>
                  <ScrollCarousel showLeftArrow>
                    {place.socialComments.map((c) => (
                      <div key={c.id} className="shrink-0 w-40 sm:w-44 snap-start rounded-xl overflow-hidden border border-slate-100">
                        <div className="relative w-full aspect-[4/5] bg-slate-100">
                          <Image src={c.imageUrl} alt="" fill sizes="180px" className="object-cover" />
                        </div>
                        <div className="px-2.5 py-2">
                          <p className="text-xs font-semibold text-slate-600 truncate">
                            {c.authorName || "Khách hàng"} <span className="text-slate-300">·</span> {PLATFORM_LABEL[c.platform] ?? "Khác"}
                          </p>
                          <p className="text-[11px] text-slate-400">{timeAgo(c.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </ScrollCarousel>
                </section>
              )}

              {latestReviews.length > 0 && (
                <section className="bg-white rounded-2xl shadow-game-card p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4 gap-3">
                    <h2 className="font-display font-bold text-lg text-slate-800 flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-amber-50 text-brand-gold flex items-center justify-center text-sm">
                        <i className="fa-solid fa-star" aria-hidden="true" />
                      </span>
                      Đánh giá từ khách
                    </h2>
                    <span className="text-sm font-bold text-slate-700">
                      {ratingAverage.toFixed(1)}<span className="text-slate-400 font-medium">/5 · {ratingTotal} đánh giá</span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    {latestReviews.map((r) => (
                      <article key={r.id} className="rounded-xl bg-brand-tint/70 border border-brand-blueMid/50 p-4">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="relative w-9 h-9 rounded-full overflow-hidden bg-brand-sky text-brand-blue flex items-center justify-center font-bold text-sm shrink-0">
                            {r.reviewerAvatar ? (
                              <Image src={r.reviewerAvatar} alt="" fill sizes="36px" className="object-cover" />
                            ) : (
                              r.reviewerName.charAt(0).toUpperCase()
                            )}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-700 truncate">{r.reviewerName}</p>
                            <p className="text-[11px] text-slate-400">{timeAgo(r.createdAt)}</p>
                          </div>
                          <span className="flex text-brand-gold text-xs shrink-0">
                            {Array.from({ length: 5 }, (_, i) => (
                              <i key={i} className={i < r.rating ? "fa-solid fa-star" : "fa-regular fa-star"} aria-hidden="true" />
                            ))}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{r.content}</p>
                        {r.images.length > 0 && (
                          <div className="flex gap-2 mt-2.5">
                            {r.images.map((img) => (
                              <span key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
                                <Image src={img.url} alt="" fill sizes="64px" className="object-cover" />
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <aside className="min-w-0 space-y-4 lg:sticky lg:top-[124px]">
              {hasContact && (
                <div className="bg-white rounded-2xl shadow-game-card p-5 ring-1 ring-brand-blue/10">
                  <p className="font-display font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <i className="fa-solid fa-headset text-brand-blue" aria-hidden="true" /> Liên hệ trực tiếp
                  </p>
                  {place.phone && (
                    <>
                      <p className="font-display font-extrabold text-2xl text-slate-800 tracking-wide">{place.phone}</p>
                      <a
                        href={`tel:${place.phone}`}
                        className="mt-3 flex items-center justify-center gap-2 w-full h-12 rounded-full bg-brand-blue text-white font-bold hover:brightness-95 transition"
                      >
                        <i className="fa-solid fa-phone" aria-hidden="true" /> Gọi ngay
                      </a>
                    </>
                  )}
                  {socials.length > 0 && (
                    <div className={`grid grid-cols-2 gap-2 ${place.phone ? "mt-2.5" : ""}`}>
                      {socials.map((s) => (
                        <a
                          key={s.key}
                          href={place[s.key] as string}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 h-11 rounded-full text-white text-sm font-bold hover:brightness-110 transition ${s.color}`}
                        >
                          <i className={s.icon} aria-hidden="true" /> {s.label}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="text-[12px] text-slate-400 mt-3 leading-snug">Khi liên hệ, hãy nói bạn biết Sale qua BookingPhanThiet.com.</p>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-game-card p-5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="font-display font-bold text-slate-800 flex items-center gap-2">
                    <i className="fa-solid fa-ranking-star text-brand-blue" aria-hidden="true" /> Điểm uy tín
                  </p>
                  <SaleRankBadge points={place.salePoints} size="md" />
                </div>
                <p className="font-display font-extrabold text-3xl text-slate-800 leading-none">
                  {place.salePoints}
                  <span className="text-sm font-semibold text-slate-400"> điểm</span>
                </p>
                <div className="h-2.5 rounded-full bg-brand-sky overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-blueLight to-brand-blue" style={{ width: `${rankInfo.percent}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {rankInfo.next ? `Còn ${rankInfo.missing} điểm để lên hạng “${rankInfo.next.label}”` : "Đã đạt hạng uy tín cao nhất"}
                </p>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">Điểm tính tự động từ mức hoàn thiện hồ sơ, video, phản hồi và đánh giá thật của khách.</p>
              </div>

              <div className="rounded-2xl bg-brand-tint border border-brand-blueMid/70 p-5">
                <p className="font-bold text-sm text-brand-blueDark mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-lightbulb" aria-hidden="true" /> Mẹo an toàn khi đặt dịch vụ
                </p>
                <ul className="text-[13px] text-slate-600 space-y-1.5 list-disc pl-4 leading-snug">
                  <li>Xem đánh giá và video thật của Sale trước khi liên hệ.</li>
                  <li>Chốt giá, thời gian và điều kiện bằng tin nhắn trước khi đặt cọc.</li>
                  <li>Gặp vấn đề? Báo cho quản trị viên để hồ sơ được xem xét.</li>
                </ul>
              </div>
            </aside>
          </div>

          <div className="text-center mt-8">
            <Link href="/sale" className="text-sm font-semibold text-slate-500 hover:text-brand-blue transition">
              <i className="fa-solid fa-arrow-left mr-1.5" aria-hidden="true" /> Xem tất cả Sale uy tín
            </Link>
          </div>
        </div>

        {/* Thanh liên hệ dính đáy màn hình điện thoại */}
        {hasContact && (
          <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 px-4 py-2.5 flex items-center gap-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
            {place.phone && (
              <a href={`tel:${place.phone}`} className="flex-1 h-11 rounded-full bg-brand-blue text-white font-bold flex items-center justify-center gap-2">
                <i className="fa-solid fa-phone" aria-hidden="true" /> Gọi ngay
              </a>
            )}
            {place.zaloUrl && (
              <a href={place.zaloUrl} target="_blank" rel="noopener noreferrer" className="flex-1 h-11 rounded-full bg-[#0068FF] text-white font-bold flex items-center justify-center gap-2">
                <i className="fa-solid fa-comment-dots" aria-hidden="true" /> Zalo
              </a>
            )}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
