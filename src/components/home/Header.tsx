import Image from "next/image";
import Link from "next/link";
import LanguageSwitcher from "./LanguageSwitcher";
import HeaderNav from "./HeaderNav";
import MobileNavToggle from "./MobileNavToggle";
import HeaderCoinBadge from "./HeaderCoinBadge";
import T from "@/lib/i18n/T";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";

export default async function Header() {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()]);
  const isUserSession = (session?.user as { type?: string } | undefined)?.type === "user";

  // Không dùng trực tiếp session.user.image/name — JWT chỉ chứa dữ liệu tại thời điểm
  // đăng nhập, nên sau khi người dùng đổi avatar/tên trong hồ sơ, session sẽ bị cũ.
  // Lấy avatar/tên mới nhất trực tiếp từ DB để header luôn hiển thị đúng.
  const user = isUserSession
    ? await prisma.user.findUnique({
        where: { id: (session!.user as { id: string }).id },
        select: { name: true, avatar: true, warnedAt: true, coins: true },
      })
    : null;

  return (
    <header className="bg-navbar-gradient header-ocean-sheen sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,80,150,0.10)]">
      <div className="container-custom">
        <div className="flex items-center justify-between h-[72px] lg:h-[100px]">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={settings.logoUrl}
              alt="Booking Phan Thiết"
              width={160}
              height={160}
              priority
              className="w-[68px] sm:w-[80px] lg:w-[118px] h-auto object-contain select-none"
            />
          </Link>

          <HeaderNav />

          <div className="flex items-center gap-3 lg:gap-4">
            <span className="hidden xl:block w-px h-7 bg-white/25" aria-hidden="true" />
            <LanguageSwitcher />
            {user && <HeaderCoinBadge initialCoins={user.coins} avatar={user.avatar || "/images/avatar-world.png"} name={user.name} />}
            {user ? (
              <Link href="/tai-khoan" className="relative flex items-center shrink-0" aria-label="Tài khoản của bạn">
                <Image
                  src={user.avatar || "/images/avatar-world.png"}
                  alt={user.name || "Tài khoản"}
                  width={40}
                  height={40}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/70 hover:ring-white transition"
                />
                {user.warnedAt && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-red text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white"
                    aria-label="Tài khoản có cảnh báo từ quản trị viên"
                  >
                    !
                  </span>
                )}
              </Link>
            ) : (
              <Link
                href="/dang-nhap"
                aria-label="Đăng nhập"
                className="flex items-center gap-1.5 w-10 h-10 sm:w-auto sm:h-auto justify-center sm:bg-white sm:hover:bg-slate-100 hover:bg-white/10 transition rounded-full sm:pl-3 sm:pr-4 sm:py-2 text-sm font-bold text-white sm:text-brand-blue sm:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              >
                <i className="fa-solid fa-user text-base sm:text-sm" aria-hidden="true" />
                <span className="hidden sm:inline">
                  <T id="auth.login">Đăng nhập</T>
                </span>
              </Link>
            )}
            <MobileNavToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
