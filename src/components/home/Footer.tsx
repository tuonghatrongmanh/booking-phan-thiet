import Link from "next/link";
import Image from "next/image";
import T from "@/lib/i18n/T";
import FooterNewsletterInput from "./FooterNewsletterInput";
import { getSiteSettings } from "@/lib/settings";

const SOCIAL_LINKS = [
  { icon: "fa-brands fa-facebook-f", href: "#", label: "Facebook" },
  { icon: "fa-brands fa-tiktok", href: "#", label: "TikTok" },
  { icon: "fa-brands fa-instagram", href: "#", label: "Instagram" },
  { icon: "fa-solid fa-comment-dots", href: "#", label: "Zalo" },
];

export default async function Footer() {
  const settings = await getSiteSettings();
  return (
    <footer className="bg-brand-footer text-white/70 relative">
      <div className="h-1 bg-gradient-to-r from-brand-blue via-brand-gold to-brand-blue" aria-hidden="true" />

      <div className="container-custom py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src={settings.logoUrl}
                alt="Booking Phan Thiết"
                width={44}
                height={44}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-brand-gold"
              />
              <div className="leading-tight">
                <p className="font-display font-bold text-white text-base -mb-1">BOOKING</p>
                <p className="font-display font-bold text-brand-gold text-xs tracking-wide">PHAN THIẾT</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-5">
              <T id="footer.tagline">{settings.footerDescription}</T>
            </p>
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-gold hover:text-brand-footer transition flex items-center justify-center text-white/80"
                >
                  <i className={s.icon} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-[2px] after:bg-brand-gold">
              <T id="footer.col.category">DANH MỤC</T>
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/luu-tru" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.cat.homestay">Homestay</T></Link></li>
              <li><Link href="/thue-xe" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.cat.carRental">Thuê xe</T></Link></li>
              <li><Link href="/#sale-uy-tin" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.cat.sale">Sale uy tín</T></Link></li>
              <li><Link href="/am-thuc" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.cat.restaurant">Quán ăn ngon</T></Link></li>
              <li><Link href="/diem-tham-quan" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.cat.attraction">Điểm tham quan</T></Link></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-[2px] after:bg-brand-gold">
              <T id="footer.col.support">HỖ TRỢ</T>
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.support.guide">Hướng dẫn sử dụng</T></a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.support.faq">Câu hỏi thường gặp</T></a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.support.privacy">Chính sách bảo mật</T></a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.support.terms">Điều khoản sử dụng</T></a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.support.contact">Liên hệ hỗ trợ</T></a></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-[2px] after:bg-brand-gold">
              <T id="footer.col.community">CỘNG ĐỒNG</T>
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.community.recentReviews">Đánh giá gần đây</T></a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.community.leaderboard">Bảng xếp hạng</T></a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.community.scamReports">Chia sẻ lừa đảo</T></a></li>
              <li><Link href="/tin-tuc" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.community.news">Tin tức du lịch</T></Link></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block"><T id="footer.community.events">Sự kiện &amp; khuyến mãi</T></a></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-[2px] after:bg-brand-gold">
              <T id="footer.col.newsletter">NHẬN TIN TỨC &amp; ƯU ĐÃI</T>
            </p>
            <p className="text-sm leading-relaxed mb-3.5">
              <T id="footer.newsletter.desc">Đăng ký để nhận thông tin du lịch Phan Thiết mới nhất!</T>
            </p>
            <div className="flex rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <FooterNewsletterInput />
              <button className="bg-brand-gold hover:brightness-95 transition text-brand-footer text-sm font-bold px-4 shrink-0">
                <T id="footer.newsletter.button">Đăng ký</T>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-white/50">
              <i className="fa-solid fa-shield-halved text-brand-gold" aria-hidden="true" />
              <span>Thông tin của bạn được bảo mật an toàn</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>
            &copy; {new Date().getFullYear()} Booking Phan Thiết. <T id="footer.rights">All rights reserved.</T>
          </p>
          <p className="flex items-center gap-1">
            Made with
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#e8483a">
              <path d="M12 21s-7-4.5-9.5-9C1 8 3 4 7 4c2.2 0 3.7 1.3 5 3 1.3-1.7 2.8-3 5-3 4 0 6 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
            </svg>
            <T id="footer.madeFor">for Phan Thiết</T>
          </p>
        </div>
      </div>
    </footer>
  );
}
