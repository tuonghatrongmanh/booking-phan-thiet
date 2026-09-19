import Link from "next/link";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import { getSiteSettings } from "@/lib/settings";

export type LegalSection = { title: string; paragraphs?: string[]; bullets?: string[] };

// Khung chung cho các trang pháp lý (Chính sách bảo mật, Điều khoản): tiêu đề, mục lục, các mục
// đánh số và mục "Liên hệ" lấy từ Cài đặt (email/SĐT/địa chỉ do admin điền).
export default async function LegalLayout({
  title,
  intro,
  updated,
  sections,
  otherLink,
}: {
  title: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
  otherLink: { href: string; label: string };
}) {
  const s = await getSiteSettings();
  const contact = [s.orgEmail && `Email: ${s.orgEmail}`, s.orgPhone && `Điện thoại: ${s.orgPhone}`, s.orgAddress && `Địa chỉ: ${s.orgAddress}`].filter(Boolean) as string[];

  return (
    <>
      <Header />
      <div className="bg-food-bg min-h-screen">
        <div className="max-w-[860px] mx-auto px-6 sm:px-8 py-8 sm:py-12">
          <nav className="text-[13px] text-food-textMuted font-semibold flex items-center gap-1.5 mb-5">
            <Link href="/" className="hover:text-brand-blue">Trang chủ</Link>
            <i className="fa-solid fa-chevron-right text-[9px]" aria-hidden="true" />
            <span className="text-food-text">{title}</span>
          </nav>

          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-food-text mb-2">{title}</h1>
          <p className="text-sm text-food-textMuted mb-5">Cập nhật lần cuối: {updated}</p>
          <p className="text-slate-600 leading-relaxed mb-6">{intro}</p>

          <div className="bg-white rounded-2xl shadow-game-card p-5 mb-6">
            <p className="font-bold text-food-text mb-2 text-sm">Nội dung</p>
            <ol className="text-sm text-brand-blue space-y-1 list-decimal pl-5">
              {sections.map((sec, i) => (
                <li key={sec.title}>
                  <a href={`#muc-${i + 1}`} className="hover:underline">{sec.title}</a>
                </li>
              ))}
              <li><a href="#lien-he" className="hover:underline">Liên hệ</a></li>
            </ol>
          </div>

          <div className="bg-white rounded-2xl shadow-game-card p-6 sm:p-8 space-y-8">
            {sections.map((sec, i) => (
              <section key={sec.title} id={`muc-${i + 1}`} className="scroll-mt-28">
                <h2 className="font-display font-bold text-xl text-food-text mb-3">
                  {i + 1}. {sec.title}
                </h2>
                {sec.paragraphs?.map((p) => (
                  <p key={p} className="text-slate-600 leading-relaxed mb-3">{p}</p>
                ))}
                {sec.bullets && (
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 leading-relaxed">
                    {sec.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section id="lien-he" className="scroll-mt-28">
              <h2 className="font-display font-bold text-xl text-food-text mb-3">Liên hệ</h2>
              <p className="text-slate-600 leading-relaxed mb-2">
                Mọi câu hỏi, yêu cầu về nội dung này hoặc về dữ liệu cá nhân của bạn, vui lòng liên hệ {s.orgName || "Booking Phan Thiết"}:
              </p>
              {contact.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  {contact.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-600">
                  qua các kênh liên hệ trong trang <Link href="/gioi-thieu" className="text-brand-blue font-semibold underline">Về chúng tôi</Link>.
                </p>
              )}
            </section>
          </div>

          <p className="text-center mt-6 text-sm">
            <Link href={otherLink.href} className="text-brand-blue font-semibold hover:underline">{otherLink.label}</Link>
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
