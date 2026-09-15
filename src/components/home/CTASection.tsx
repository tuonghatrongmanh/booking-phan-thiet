import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import T from "@/lib/i18n/T";

// Banner CTA quan ly duoc qua Admin > Banner - lay banner active co sortOrder nho nhat.
// Neu admin chua tao banner nao thi fallback ve noi dung tinh mac dinh (khong de trong).
export default async function CTASection() {
  const banner = await prisma.ctaBanner.findFirst({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const image = banner?.image ?? "/images/lua-dao.png";
  const buttonHref = banner?.buttonHref || "#";

  return (
    <section className="container-custom pb-10">
      <div className="relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[320px] lg:min-h-[380px] flex items-end">
        <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        <div className="relative z-10 w-full flex flex-col items-center text-center py-10 px-6">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" className="mb-2 opacity-90">
            <path d="M12 2l7 3v6c0 5-3.4 8.4-7 10-3.6-1.6-7-5-7-10V5l7-3z" />
          </svg>
          <h3 className="font-display font-extrabold text-white text-2xl sm:text-3xl mb-2 drop-shadow">
            {banner?.title ?? <T id="section.cta.title">Bạn đã từng bị lừa đảo?</T>}
          </h3>
          <p className="text-white/85 mb-5">
            {banner?.subtitle ?? <T id="section.cta.subtitle">Chia sẻ để bảo vệ cộng đồng du lịch Phan Thiết</T>}
          </p>
          <Link
            href={buttonHref}
            className="flex items-center gap-2 bg-brand-orange hover:brightness-95 transition text-white font-bold rounded-full px-6 py-3 shadow-lg"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11v2a2 2 0 0 0 2 2h1l3 4v-4h8a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H8L5 4v3H5a2 2 0 0 0-2 2z" />
            </svg>
            {banner?.buttonText ?? <T id="section.cta.button">Chia sẻ ngay</T>}
          </Link>
        </div>
      </div>
    </section>
  );
}
