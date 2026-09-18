import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import Pagination from "@/components/admin/Pagination";
import { findReviewBursts, BURST_THRESHOLD } from "@/lib/review-guard";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 5;

type SearchParams = { kind?: string; page?: string; low?: string };

function placeHref(place: { id: string; category: string }) {
  if (place.category === "HOMESTAY") return `/luu-tru/${place.id}`;
  if (place.category === "ATTRACTION") return `/diem-tham-quan/${place.id}`;
  return `/sale/${place.id}`;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={rating <= 2 ? "text-brand-red font-bold" : "text-amber-500 font-bold"}>
      {rating}★
    </span>
  );
}

function buildHref(kind: string, page: number, low: boolean) {
  const q = new URLSearchParams({ kind, page: String(page) });
  if (low) q.set("low", "1");
  return `/admin/user-reviews?${q.toString()}`;
}

export default async function AdminUserReviewsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const kind = sp.kind === "place" ? "place" : "food";
  const low = sp.low === "1";
  const page = Math.max(1, Number(sp.page) || 1);
  const ratingWhere = low ? { rating: { lte: 2 } } : {};

  const bursts = await findReviewBursts();

  const foodPromise =
    kind === "food"
      ? Promise.all([
          prisma.foodReview.count({ where: ratingWhere }),
          prisma.foodReview.findMany({
            where: ratingWhere,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            include: { user: { select: { name: true } }, food: { select: { name: true, slug: true } } },
          }),
        ])
      : null;
  const placePromise =
    kind === "place"
      ? Promise.all([
          prisma.placeReview.count({ where: ratingWhere }),
          prisma.placeReview.findMany({
            where: ratingWhere,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            include: { user: { select: { name: true } }, place: { select: { id: true, name: true, category: true } } },
          }),
        ])
      : null;

  const [foodData, placeData] = await Promise.all([foodPromise, placePromise]);
  const total = foodData?.[0] ?? placeData?.[0] ?? 0;
  const rows = [
    ...(foodData?.[1] ?? []).map((r) => ({
      id: r.id,
      user: r.user.name,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
      targetName: r.food.name,
      href: `/am-thuc/mon/${r.food.slug}`,
    })),
    ...(placeData?.[1] ?? []).map((r) => ({
      id: r.id,
      user: r.user.name,
      rating: r.rating,
      content: r.content,
      createdAt: r.createdAt,
      targetName: r.place.name,
      href: placeHref(r.place),
    })),
  ];
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tabCls = (active: boolean) =>
    `px-4 py-2 rounded-full text-sm font-bold transition ${active ? "bg-brand-blue text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">Kiểm duyệt đánh giá</h1>
        <p className="text-slate-400">
          Xóa đánh giá spam / bão đánh giá xấu của thành viên trên Ẩm thực, Lưu trú và Điểm tham quan ({total} đánh giá)
        </p>
      </div>

      {bursts.length > 0 && (
        <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="font-bold text-amber-800 mb-2">
            <i className="fa-solid fa-triangle-exclamation mr-2" aria-hidden="true" />
            Nghi có bão đánh giá xấu (từ {BURST_THRESHOLD} đánh giá ≤2★ trong 24 giờ qua)
          </p>
          <ul className="text-sm text-amber-900 space-y-1">
            {bursts.map((b) => (
              <li key={`${b.kind}-${b.targetId}`}>
                <strong>{b.name}</strong> — {b.count} đánh giá ≤2★{" "}
                <Link href={buildHref(b.kind, 1, true)} className="text-brand-blue font-semibold hover:underline">
                  Xem & xử lý
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href={buildHref("food", 1, low)} className={tabCls(kind === "food")}>
          Ẩm thực
        </Link>
        <Link href={buildHref("place", 1, low)} className={tabCls(kind === "place")}>
          Lưu trú & Điểm tham quan
        </Link>
        <span className="mx-1 text-slate-300">|</span>
        <Link href={buildHref(kind, 1, !low)} className={tabCls(low)}>
          Chỉ hiện ≤2★
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-x-auto">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-slate-400">Chưa có đánh giá nào.</p>
        ) : (
          <table className="w-full text-sm min-w-[680px]">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-semibold">Thành viên</th>
                <th className="px-5 py-3 font-semibold">Sao</th>
                <th className="px-5 py-3 font-semibold">Nội dung</th>
                <th className="px-5 py-3 font-semibold">Đánh giá cho</th>
                <th className="px-5 py-3 font-semibold">Thời gian</th>
                <th className="px-5 py-3 font-semibold text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 font-semibold text-slate-800 whitespace-nowrap">{r.user}</td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <Stars rating={r.rating} />
                  </td>
                  <td className="px-5 py-3 text-slate-500 max-w-[320px]">
                    <p className="line-clamp-2">{r.content}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Link href={r.href} target="_blank" className="text-brand-blue hover:underline line-clamp-1 max-w-[200px] inline-block">
                      {r.targetName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <DeleteButton url={`/api/admin/user-reviews/${kind}/${r.id}`} confirmText="Xóa đánh giá này?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} buildHref={(p) => buildHref(kind, p, low)} />
    </div>
  );
}
