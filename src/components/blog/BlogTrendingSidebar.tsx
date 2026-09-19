import Link from "next/link";
import type { News } from "@prisma/client";
import NewsCoverImage from "@/components/home/NewsCoverImage";
import { formatNewsDate } from "@/components/blog/NewsCard";

// Cot phai: top bai doc nhieu nhat (co so thu tu) + the moi vao cac muc dich vu cua site
export default function BlogTrendingSidebar({ trending }: { trending: News[] }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-game-card p-5">
        <p className="flex items-center gap-2.5 font-display font-bold text-food-text mb-2">
          <span className="w-8 h-8 rounded-full bg-food-light text-food-primary flex items-center justify-center text-sm">
            <i className="fa-solid fa-fire" aria-hidden="true" />
          </span>
          Đọc nhiều nhất
        </p>
        <div>
          {trending.map((item, i) => (
            <Link key={item.id} href={`/tin-tuc/${item.slug}`} className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0 group">
              <span className="font-display font-extrabold text-2xl text-brand-blueMid w-6 text-center shrink-0">{i + 1}</span>
              <div className="relative w-[72px] h-14 shrink-0 rounded-lg overflow-hidden bg-food-light">
                <NewsCoverImage src={item.coverImage} alt={item.title} fit="cover" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-food-text line-clamp-2 leading-snug group-hover:text-brand-blue transition-colors">{item.title}</p>
                <p className="text-[11px] text-food-textMuted mt-1">
                  {formatNewsDate(item.createdAt)} · {item.views.toLocaleString("vi-VN")} lượt xem
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-food-navy text-white p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern-bpt-light.png')] bg-[length:420px_340px] opacity-70" aria-hidden="true" />
        <div className="relative">
          <p className="font-display font-bold text-lg leading-snug mb-1.5">Lên kế hoạch cho chuyến đi</p>
          <p className="text-sm text-white/80 mb-4">Đặt homestay, thuê xe và tìm quán ăn ngon ngay trên BookingPhanThiet.com.</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/luu-tru" className="inline-flex items-center gap-1.5 bg-white text-food-navy text-sm font-bold rounded-full px-4 py-2 hover:brightness-95 transition">
              <i className="fa-solid fa-bed text-xs" aria-hidden="true" /> Lưu trú
            </Link>
            <Link href="/thue-xe" className="inline-flex items-center gap-1.5 bg-white/15 border border-white/30 text-sm font-bold rounded-full px-4 py-2 hover:bg-white/25 transition">
              <i className="fa-solid fa-motorcycle text-xs" aria-hidden="true" /> Thuê xe
            </Link>
            <Link href="/am-thuc" className="inline-flex items-center gap-1.5 bg-white/15 border border-white/30 text-sm font-bold rounded-full px-4 py-2 hover:bg-white/25 transition">
              <i className="fa-solid fa-utensils text-xs" aria-hidden="true" /> Ẩm thực
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
