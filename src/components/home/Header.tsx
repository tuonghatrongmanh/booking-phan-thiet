import Image from "next/image";
import Link from "next/link";
import HeaderNav from "./HeaderNav";
import MobileNavToggle from "./MobileNavToggle";
import HeaderSettingsButton from "./HeaderSettingsButton";
import HeaderLangToggle from "./HeaderLangToggle";
import HeaderCoinBadge from "./HeaderCoinBadge";
import UserNotificationBell from "./UserNotificationBell";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { cssUrl, getActiveTheme } from "@/lib/site-theme";
import { getUiSlots } from "@/lib/ui-slots";

export default async function Header() {
  const [session, settings, theme, slots] = await Promise.all([auth(), getSiteSettings(), getActiveTheme(), getUiSlots()]);
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

  // Sale uy tín đã được duyệt: avatar/menu dẫn thẳng tới hồ sơ Sale của mình
  const saleProfile = user
    ? await prisma.place.findFirst({ where: { userId: (session!.user as { id: string }).id, category: "SALE", hidden: false }, select: { id: true } })
    : null;

  // Chủ homestay/xe được admin gán: menu avatar có thêm lối vào Cổng đối tác
  const partnerCount = user ? await prisma.place.count({ where: { partnerUserId: (session!.user as { id: string }).id, category: { in: ["HOMESTAY", "CAR_RENTAL"] } } }) : 0;

  return (
    <header className="bg-navbar-gradient header-ocean-sheen sticky top-0 z-50 shadow-[0_2px_12px_rgba(0,59,149,0.10)]">
      {theme.headerImage && (
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: cssUrl(theme.headerImage) }} />
      )}
      <div className="container-custom">
        <div className="flex items-center justify-between h-[72px] lg:h-[100px]">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={settings.logoUrl}
              alt="Booking Phan Thiết"
              width={220}
              height={64}
              priority
              className="w-[128px] sm:w-[150px] lg:w-[196px] h-auto object-contain select-none"
            />
          </Link>

          <HeaderNav />

          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <span className="hidden xl:block w-px h-7 bg-white/25" aria-hidden="true" />
            {user && <HeaderCoinBadge initialCoins={user.coins} avatar={user.avatar || "/images/avatar-world.png"} name={user.name} />}
            {user ? (
              <UserNotificationBell avatar={user.avatar || "/images/avatar-world.png"} name={user.name} warned={Boolean(user.warnedAt)} saleProfileId={saleProfile?.id ?? null} partnerCount={partnerCount} />
            ) : (
              <Link
                href="/dang-nhap"
                aria-label="Đăng nhập"
                className="flex items-center gap-1.5 whitespace-nowrap shrink-0 w-10 h-10 sm:w-auto sm:h-auto justify-center sm:bg-white sm:hover:bg-slate-100 hover:bg-white/10 transition rounded-full sm:pl-3 sm:pr-4 sm:py-2 text-sm font-bold text-white sm:text-brand-blue sm:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
              >
                {slots["login-icon"] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={slots["login-icon"]} alt="" className="w-5 h-5 object-contain" />
                ) : (
                  <i className="fa-solid fa-user text-base sm:text-sm" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                  Đăng nhập
                </span>
              </Link>
            )}
            <HeaderLangToggle />
            <HeaderSettingsButton />
            <MobileNavToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
