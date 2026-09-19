import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { collectSameAs, FOUNDER_ID, ORG_ID } from "@/lib/site-jsonld";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  const org = s.orgName || "Booking Phan Thiết";
  const who = s.founderName ? `${s.founderName} - ${s.founderTitle || "Người sáng lập"}` : "Về chúng tôi";
  return {
    title: `${who} | ${org}`,
    description: s.founderBio
      ? s.founderBio.slice(0, 155)
      : `Tìm hiểu về ${org}: hệ thống tra cứu và đánh giá homestay, quán ăn, dịch vụ thuê xe uy tín tại Phan Thiết.`,
    alternates: { canonical: `${SITE_URL}/gioi-thieu` },
    openGraph: { type: "profile", url: `${SITE_URL}/gioi-thieu`, ...(s.founderPhoto ? { images: [absoluteUrl(s.founderPhoto)!] } : {}) },
  };
}

const SOCIALS: { key: "facebookUrl" | "tiktokUrl" | "youtubeUrl" | "instagramUrl" | "linkedinUrl" | "zaloUrl"; icon: string; label: string }[] = [
  { key: "facebookUrl", icon: "fa-brands fa-facebook-f", label: "Facebook" },
  { key: "tiktokUrl", icon: "fa-brands fa-tiktok", label: "TikTok" },
  { key: "youtubeUrl", icon: "fa-brands fa-youtube", label: "YouTube" },
  { key: "instagramUrl", icon: "fa-brands fa-instagram", label: "Instagram" },
  { key: "linkedinUrl", icon: "fa-brands fa-linkedin-in", label: "LinkedIn" },
  { key: "zaloUrl", icon: "fa-solid fa-comment-dots", label: "Zalo" },
];

const FEATURES = [
  { icon: "fa-solid fa-shield-halved", title: "Thông tin minh bạch", text: "Mỗi địa điểm, quán ăn, dịch vụ đều hiển thị rõ thông tin liên hệ, giá và đánh giá thực tế từ cộng đồng." },
  { icon: "fa-solid fa-triangle-exclamation", title: "Cảnh báo lừa đảo", text: "Cộng đồng chia sẻ và cảnh báo các hành vi lừa đảo để du khách Phan Thiết không bị thiệt hại." },
  { icon: "fa-solid fa-hand-holding-heart", title: "Cộng đồng vì cộng đồng", text: "Nội dung do thành viên thật đóng góp, được kiểm duyệt để giữ chất lượng và sự công bằng." },
];

export default async function GioiThieuPage() {
  const s = await getSiteSettings();
  const org = s.orgName || "Booking Phan Thiết";

  const [homestays, foods, attractions, placeReviews, foodReviews] = await Promise.all([
    prisma.place.count({ where: { category: "HOMESTAY", hidden: false } }),
    prisma.food.count({ where: { active: true } }),
    prisma.place.count({ where: { category: "ATTRACTION", hidden: false } }),
    prisma.placeReview.count(),
    prisma.foodReview.count(),
  ]);

  const stats = [
    { value: homestays, label: "Chỗ lưu trú" },
    { value: foods, label: "Món ăn & quán ăn" },
    { value: attractions, label: "Điểm tham quan" },
    { value: placeReviews + foodReviews, label: "Đánh giá từ thành viên" },
  ].filter((x) => x.value > 0);

  const sameAs = collectSameAs(s);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${SITE_URL}/gioi-thieu`,
    url: `${SITE_URL}/gioi-thieu`,
    name: `Về ${org}`,
    inLanguage: "vi-VN",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": ORG_ID },
    ...(s.founderName ? { mainEntity: { "@id": FOUNDER_ID } } : {}),
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Header />

      <section className="bg-hero-gradient">
        <div className="container-custom py-14 text-center">
          <p className="text-brand-blue font-bold text-sm tracking-wide uppercase mb-2">Về chúng tôi</p>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-brand-footer">{org}</h1>
          <p className="max-w-2xl mx-auto mt-3 text-slate-600 leading-relaxed">{s.homeSeoDescription}</p>
        </div>
      </section>

      <main className="container-custom py-12 space-y-12">
        {s.founderName && (
          <section aria-labelledby="founder-heading" className="bg-white rounded-3xl shadow-card p-6 sm:p-10 grid md:grid-cols-[260px_1fr] gap-8 items-center">
            <div className="mx-auto w-[220px] md:w-full">
              {s.founderPhoto ? (
                <Image
                  src={s.founderPhoto}
                  alt={`${s.founderName} - ${s.founderTitle || "Người sáng lập"} ${org}`}
                  width={520}
                  height={520}
                  className="w-full aspect-square object-cover rounded-3xl shadow-lg"
                />
              ) : (
                <div className="w-full aspect-square rounded-3xl bg-brand-sky flex items-center justify-center text-brand-blue text-6xl">
                  <i className="fa-solid fa-user" aria-hidden="true" />
                </div>
              )}
            </div>
            <div>
              <p className="text-brand-blue font-bold text-sm uppercase tracking-wide">{s.founderTitle || "Người sáng lập"}</p>
              <h2 id="founder-heading" className="font-display font-extrabold text-3xl text-brand-footer mt-1">{s.founderName}</h2>
              {s.founderBio && <p className="text-slate-600 leading-relaxed mt-4 whitespace-pre-line">{s.founderBio}</p>}

              <div className="flex flex-wrap gap-2.5 mt-6">
                {SOCIALS.filter((x) => s[x.key]).map((x) => (
                  <a
                    key={x.key}
                    href={s[x.key]}
                    target="_blank"
                    rel="me noopener noreferrer"
                    aria-label={`${x.label} của ${s.founderName}`}
                    className="inline-flex items-center gap-2 bg-brand-sky text-brand-blue font-semibold text-sm rounded-full px-4 py-2 hover:bg-brand-blue hover:text-white transition"
                  >
                    <i className={x.icon} aria-hidden="true" /> {x.label}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {stats.length > 0 && (
          <section aria-label="Số liệu hệ thống" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((x) => (
              <div key={x.label} className="bg-white rounded-2xl shadow-card p-6 text-center">
                <p className="font-display font-extrabold text-4xl text-brand-blue">{x.value.toLocaleString("vi-VN")}</p>
                <p className="text-sm text-slate-500 mt-1">{x.label}</p>
              </div>
            ))}
          </section>
        )}

        <section className="grid md:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl shadow-card p-6">
              <div className="w-12 h-12 rounded-xl bg-brand-sky text-brand-blue flex items-center justify-center text-xl mb-4">
                <i className={f.icon} aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-800 mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </section>

        {(s.orgPhone || s.orgEmail || s.orgAddress || sameAs.length > 0) && (
          <section className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
            <h2 className="font-display font-bold text-xl text-slate-800 mb-4">Liên hệ</h2>
            <ul className="space-y-2 text-slate-600">
              {s.orgAddress && <li><i className="fa-solid fa-location-dot text-brand-blue w-6" aria-hidden="true" /> {s.orgAddress}</li>}
              {s.orgPhone && <li><i className="fa-solid fa-phone text-brand-blue w-6" aria-hidden="true" /> <a href={`tel:${s.orgPhone}`} className="hover:text-brand-blue">{s.orgPhone}</a></li>}
              {s.orgEmail && <li><i className="fa-solid fa-envelope text-brand-blue w-6" aria-hidden="true" /> <a href={`mailto:${s.orgEmail}`} className="hover:text-brand-blue">{s.orgEmail}</a></li>}
            </ul>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
