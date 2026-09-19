import Link from "next/link";

export default function EndCTA() {
  return (
    <div className="mt-6 bg-food-navy rounded-2xl p-6 sm:p-8 text-center text-white">
      <p className="font-display font-bold text-xl sm:text-2xl mb-4">Bạn muốn khám phá Phan Thiết?</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/luu-tru" className="bg-white text-food-navy font-bold rounded-full px-5 py-2.5 hover:brightness-95 transition">
          Đặt tour
        </Link>
        <Link href="/thue-xe" className="bg-white/15 border border-white/30 font-bold rounded-full px-5 py-2.5 hover:bg-white/25 transition">
          Thuê xe
        </Link>
        <Link href="/luu-tru" className="bg-white/15 border border-white/30 font-bold rounded-full px-5 py-2.5 hover:bg-white/25 transition">
          Xem homestay
        </Link>
      </div>
    </div>
  );
}
