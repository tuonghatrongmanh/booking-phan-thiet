import { DEFAULT_THEME_VARS, deriveThemeVars } from "@/lib/theme-colors";

export type MockTheme = {
  primary: string;
  secondary?: string | null;
  footerColor?: string | null;
  heroOverlay?: string | null;
  heroOverlayOpacity?: number;
  heroImage?: string | null;
  headerImage?: string | null;
  footerImage?: string | null;
};

// Ban xem truoc thu nho cua 1 giao dien (header + hero + footer) - dung CHINH cac bien mau
// --theme-* nen thay dung nhu khach se thay; khong can admin tai anh xem truoc.
// Bien duoc dat ngay tren khung nay nen khong bi anh huong boi giao dien dang ap dung.
export default function ThemeMock({ theme, isDefault = false }: { theme: MockTheme; isDefault?: boolean }) {
  const vars = isDefault ? DEFAULT_THEME_VARS : deriveThemeVars(theme);
  const bg = (url: string) => ({ backgroundImage: `url("${encodeURI(url)}")` });

  return (
    <div style={vars as React.CSSProperties} className="rounded-xl overflow-hidden border border-slate-200 text-[9px] select-none bg-white">
      <div className="relative bg-navbar-gradient h-8 flex items-center justify-between px-3 text-white">
        {theme.headerImage && <div className="absolute inset-0 bg-cover bg-center" style={bg(theme.headerImage)} />}
        <span className="relative font-extrabold tracking-tight">bookingphanthiet</span>
        <span className="relative flex items-center gap-2 text-white/80 font-semibold">
          <span>Lưu trú</span>
          <span>Ẩm thực</span>
          <span className="bg-white text-brand-blue rounded-full px-2 py-0.5 font-bold">Đăng nhập</span>
        </span>
      </div>

      <div className="relative h-28 bg-hero-gradient overflow-hidden">
        {theme.heroImage && <div className="absolute inset-0 bg-cover bg-center" style={bg(theme.heroImage)} />}
        <div className="absolute inset-0" style={{ background: "var(--theme-hero-overlay)" }} />
        <div className="relative px-3 pt-3">
          <p className="text-brand-blue font-extrabold italic text-[11px] leading-tight">Săn ưu đãi – Trải nghiệm tuyệt vời</p>
          <p className="text-brand-orange font-extrabold text-[13px] leading-tight mt-0.5">Homestay, Villa, Quán ăn</p>
          <span className="inline-block mt-2 bg-brand-blue text-white font-bold rounded-full px-3 py-1">Tìm kiếm</span>
        </div>
        <div className="absolute bottom-2 left-3 right-3 flex gap-1.5">
          {["Lưu trú", "Thuê xe", "Ẩm thực", "Game"].map((t) => (
            <span key={t} className="flex-1 rounded-md bg-white/90 text-brand-blue font-bold text-center py-1 shadow-sm">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="relative bg-brand-footer h-9 flex items-center px-3 text-white/70">
        {theme.footerImage && <div className="absolute inset-0 bg-cover bg-center" style={bg(theme.footerImage)} />}
        <span className="relative">© Booking Phan Thiết</span>
        <span className="relative ml-auto w-4 h-4 rounded-full bg-brand-gold" />
      </div>
    </div>
  );
}
