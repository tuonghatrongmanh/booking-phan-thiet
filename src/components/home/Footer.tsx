import Link from "next/link";
import Image from "next/image";
import FooterNewsletterInput from "./FooterNewsletterInput";
import { getSiteSettings } from "@/lib/settings";
import { cssUrl, getActiveTheme } from "@/lib/site-theme";


export default async function Footer() {
  const [settings, theme] = await Promise.all([getSiteSettings(), getActiveTheme()]);
  // Chỉ hiện mạng xã hội đã được điền ở Admin > Cài đặt (không còn liên kết "#" chết)
  const socialLinks = [
    { icon: "fa-brands fa-facebook-f", href: settings.facebookUrl, label: "Facebook" },
    { icon: "fa-brands fa-tiktok", href: settings.tiktokUrl, label: "TikTok" },
    { icon: "fa-brands fa-youtube", href: settings.youtubeUrl, label: "YouTube" },
    { icon: "fa-brands fa-instagram", href: settings.instagramUrl, label: "Instagram" },
    { icon: "fa-brands fa-linkedin-in", href: settings.linkedinUrl, label: "LinkedIn" },
    { icon: "fa-solid fa-comment-dots", href: settings.zaloUrl, label: "Zalo" },
  ].filter((x) => x.href);
  return (
    <footer className="bg-brand-footer text-white/70 relative">
      {theme.footerImage && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{ backgroundImage: cssUrl(theme.footerImage) }} />
      )}
      <div className="relative h-1 bg-gradient-to-r from-brand-blue via-brand-gold to-brand-blue" aria-hidden="true" />

      <div className="container-custom py-14 relative">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <Image
                src={settings.logoUrl}
                alt="Booking Phan Thiết"
                width={220}
                height={64}
                className="w-[190px] h-auto object-contain select-none"
              />
            </div>
            <p className="text-sm leading-relaxed mb-5">
              {settings.footerDescription}
            </p>
            <div className="flex items-center gap-2.5">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer me"
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
              DANH MỤC
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/luu-tru" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Homestay</Link></li>
              <li><Link href="/thue-xe" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Thuê xe</Link></li>
              <li><Link href="/#sale-uy-tin" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Sale uy tín</Link></li>
              <li><Link href="/am-thuc" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Quán ăn ngon</Link></li>
              <li><Link href="/diem-tham-quan" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Điểm tham quan</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-[2px] after:bg-brand-gold">
              HỖ TRỢ
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/gioi-thieu" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Về chúng tôi &amp; Người sáng lập</Link></li>
              <li><Link href="/tra-cuu-dat-cho" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Tra cứu đơn đặt phòng / thuê xe</Link></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Hướng dẫn sử dụng</a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Liên hệ hỗ trợ</a></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-[2px] after:bg-brand-gold">
              CỘNG ĐỒNG
            </p>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Đánh giá gần đây</a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Bảng xếp hạng</a></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Chia sẻ lừa đảo</a></li>
              <li><Link href="/tin-tuc" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Tin tức du lịch</Link></li>
              <li><a href="#" className="hover:text-brand-gold hover:pl-1 transition-all inline-block">Sự kiện &amp; khuyến mãi</a></li>
            </ul>
          </div>

          <div>
            <p className="font-display font-bold text-white mb-4 text-sm tracking-wide relative inline-block after:absolute after:-bottom-2 after:left-0 after:w-6 after:h-[2px] after:bg-brand-gold">
              NHẬN TIN TỨC &amp; ƯU ĐÃI
            </p>
            <p className="text-sm leading-relaxed mb-3.5">
              Đăng ký để nhận thông tin du lịch Phan Thiết mới nhất!
            </p>
            <div className="flex rounded-xl overflow-hidden shadow-lg shadow-black/20">
              <FooterNewsletterInput />
              <button className="bg-brand-gold hover:brightness-95 transition text-brand-footer text-sm font-bold px-4 shrink-0">
                Đăng ký
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4 text-xs text-white/50">
              <i className="fa-solid fa-shield-halved text-brand-gold" aria-hidden="true" />
              <span>Thông tin của bạn được bảo mật an toàn</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>
            &copy; {new Date().getFullYear()} Booking Phan Thiết. All rights reserved.
          </p>
          <p className="flex items-center gap-3">
            <Link href="/chinh-sach-bao-mat" className="hover:text-white transition">Chính sách bảo mật</Link>
            <Link href="/dieu-khoan" className="hover:text-white transition">Điều khoản sử dụng</Link>
          </p>
          <p className="flex items-center gap-1">
            Made with
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#e8483a">
              <path d="M12 21s-7-4.5-9.5-9C1 8 3 4 7 4c2.2 0 3.7 1.3 5 3 1.3-1.7 2.8-3 5-3 4 0 6 4 4.5 8-2.5 4.5-9.5 9-9.5 9z" />
            </svg>
            for Phan Thiết
          </p>
        </div>
      </div>
    </footer>
  );
}
