import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { avgOf, PLACE_STATUS_INFO } from "@/lib/places";
import type { PlaceCategory } from "@prisma/client";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ScrollTopButton from "@/components/home/ScrollTopButton";
import TranslatedField from "@/components/i18n/TranslatedField";

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// Trang chi tiet 1 dia diem (Place), dung chung cho ca "Luu tru" va "Am thuc" - dang bai
// viet: anh bia, mo ta, lien he, cung bang chung uy tin (danh gia + anh chup binh luan MXH).
export default async function PlaceDetailView({
  placeId,
  category,
  backHref,
  backLabel,
}: {
  placeId: string;
  category: PlaceCategory;
  backHref: string;
  backLabel: string;
}) {
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    include: {
      images: true,
      reviews: { orderBy: { createdAt: "desc" }, include: { images: true } },
      socialComments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!place || place.category !== category) notFound();

  const rating = avgOf(place.reviews.map((r) => r.rating));
  const statusInfo = PLACE_STATUS_INFO[place.status];

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <section className="bg-navbar-gradient py-8">
        <div className="container-custom">
          <Link href={backHref} className="inline-flex items-center gap-1.5 text-white/85 hover:text-white text-sm font-bold mb-2">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> {backLabel}
          </Link>
        </div>
      </section>

      <section className="container-custom py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="relative h-56 sm:h-72 bg-gradient-to-br from-sky-200 to-blue-400">
            {place.images[0] && <Image src={place.images[0].url} alt={place.name} fill className="object-cover" />}
            <span
              className={`absolute top-4 left-4 inline-flex items-center gap-1.5 text-xs font-bold text-white ${statusInfo.bg} px-3 py-1.5 rounded-full shadow`}
            >
              <i className={statusInfo.icon} aria-hidden="true" /> {statusInfo.label}
            </span>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3 -mt-14 mb-3">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 ring-4 ring-white shadow-lg bg-brand-sky">
                {place.avatar ? (
                  <Image src={place.avatar} alt={place.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-blue text-xl">
                    <i className="fa-solid fa-shop" aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 pt-10">
                <TranslatedField
                  as="h1"
                  model="Place"
                  recordId={place.id}
                  field="name"
                  className="font-display font-extrabold text-xl text-slate-800 truncate"
                >
                  {place.name}
                </TranslatedField>
                <div className="flex items-center gap-1 text-xs mt-0.5">
                  <span className="text-brand-gold flex">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <i key={s} className="fa-solid fa-star" style={{ opacity: s < Math.round(rating) ? 1 : 0.3 }} aria-hidden="true" />
                    ))}
                  </span>
                  <span className="font-bold text-slate-700">{rating.toFixed(1)}</span>
                  <span className="text-slate-400">({place.reviews.length} đánh giá)</span>
                </div>
              </div>
            </div>

            {place.address && (
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mb-1.5">
                <i className="fa-solid fa-location-dot text-brand-red" aria-hidden="true" /> {place.address}
              </p>
            )}

            <div className="flex items-center gap-2 mt-3">
              {place.phone && (
                <a href={`tel:${place.phone}`} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 hover:bg-slate-100 transition">
                  <i className="fa-solid fa-phone" aria-hidden="true" /> {place.phone}
                </a>
              )}
              {place.zaloUrl && (
                <a href={place.zaloUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 hover:bg-slate-100 transition">
                  <i className="fa-solid fa-comment-sms" aria-hidden="true" /> Zalo
                </a>
              )}
              {place.fanpageUrl && (
                <a href={place.fanpageUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-2 hover:bg-slate-100 transition">
                  <i className="fa-brands fa-facebook" aria-hidden="true" /> Fanpage
                </a>
              )}
            </div>

            {place.description && (
              <TranslatedField
                as="p"
                model="Place"
                recordId={place.id}
                field="description"
                className="text-[15px] text-slate-600 whitespace-pre-line mt-5"
              >
                {place.description}
              </TranslatedField>
            )}

            {place.images.length > 1 && (
              <div className="grid grid-cols-3 gap-2 mt-5">
                {place.images.slice(1).map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100">
                    <Image src={img.url} alt={img.caption ?? place.name} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {place.socialComments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 mt-5">
            <h2 className="font-display font-bold text-slate-800 mb-4">Bằng chứng uy tín từ mạng xã hội</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {place.socialComments.map((sc) => (
                <div key={sc.id} className="rounded-xl overflow-hidden border border-slate-100">
                  <div className="relative aspect-video bg-slate-100">
                    <Image src={sc.imageUrl} alt={sc.authorName ?? "Bằng chứng"} fill className="object-cover" />
                  </div>
                  {(sc.authorName || sc.note) && (
                    <div className="px-3 py-2 text-xs text-slate-500">
                      {sc.authorName && <p className="font-semibold text-slate-700">{sc.authorName}</p>}
                      {sc.note && <p>{sc.note}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 mt-5">
          <h2 className="font-display font-bold text-slate-800 mb-4">Đánh giá ({place.reviews.length})</h2>
          {place.reviews.length === 0 ? (
            <p className="text-sm text-slate-400">Chưa có đánh giá nào.</p>
          ) : (
            <div className="space-y-4">
              {place.reviews.map((r) => (
                <div key={r.id} className="flex items-start gap-2.5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 bg-brand-sky">
                    {r.reviewerAvatar && <Image src={r.reviewerAvatar} alt={r.reviewerName} fill className="object-cover" />}
                  </div>
                  <div className="bg-slate-50 rounded-2xl px-4 py-2.5 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-800">{r.reviewerName}</p>
                      <span className="text-brand-gold text-xs shrink-0">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <i key={s} className="fa-solid fa-star" style={{ opacity: s < r.rating ? 1 : 0.3 }} aria-hidden="true" />
                        ))}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 break-words mt-0.5">{r.content}</p>
                    {r.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {r.images.map((img) => (
                          <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            <Image src={img.url} alt="" fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-slate-400 mt-1.5">{formatDate(r.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
      <ScrollTopButton />
    </div>
  );
}
