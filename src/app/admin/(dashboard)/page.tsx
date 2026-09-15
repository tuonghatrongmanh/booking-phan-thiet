import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/current-admin";
import Link from "next/link";
import StatCard from "@/components/admin/StatCard";
import TrafficSection from "@/components/admin/TrafficSection";
import SecurityAlertTable from "@/components/admin/SecurityAlertTable";
import { getRecentActivity, TYPE_ICON, TYPE_COLOR } from "@/lib/admin-activity";
import { resolveDateRange, type DateRangeParams } from "@/lib/admin-date-range";

export const dynamic = "force-dynamic";

function timeAgo(date: Date): string {
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return `${diffSec}s trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  return `${Math.floor(diffHour / 24)} ngày trước`;
}

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<DateRangeParams> }) {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin && currentAdmin.role !== "SUPER_ADMIN") redirect("/admin/news");
  const sp = await searchParams;
  const { start, end, previousStart, previousEnd, label: rangeLabel, compareLabel } = resolveDateRange(sp);
  const onlineSince = new Date(Date.now() - 5 * 60 * 1000);

  const [
    newsCount, newsCountPrev,
    saleCount, saleCountPrev,
    placeCount, placeCountPrev,
    reviewCount, reviewCountPrev,
    userCount, userCountPrev,
    forumPostCount, forumPostCountPrev,
    forumCommentCount, forumCommentCountPrev,
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { createdAt: { lte: previousEnd } } }),
    prisma.sale.count({ where: { active: true } }),
    prisma.sale.count({ where: { active: true, createdAt: { lte: previousEnd } } }),
    prisma.place.count(),
    prisma.place.count({ where: { createdAt: { lte: previousEnd } } }),
    prisma.review.count(),
    prisma.review.count({ where: { createdAt: { lte: previousEnd } } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { lte: previousEnd } } }),
    prisma.forumPost.count(),
    prisma.forumPost.count({ where: { createdAt: { lte: previousEnd } } }),
    prisma.forumComment.count(),
    prisma.forumComment.count({ where: { createdAt: { lte: previousEnd } } }),
  ]);

  const [visits, visitsPrev, suspiciousCount, suspiciousCountPrev, onlineIps, uniqueIps, avgDuration, errorCount, totalRequests, activity] =
    await Promise.all([
      prisma.requestLog.count({ where: { createdAt: { gte: start, lte: end } } }),
      prisma.requestLog.count({ where: { createdAt: { gte: previousStart, lte: previousEnd } } }),
      prisma.requestLog.count({ where: { suspicious: true, createdAt: { gte: start, lte: end } } }),
      prisma.requestLog.count({ where: { suspicious: true, createdAt: { gte: previousStart, lte: previousEnd } } }),
      prisma.requestLog.findMany({ where: { createdAt: { gte: onlineSince } }, select: { ip: true }, distinct: ["ip"] }),
      prisma.requestLog.findMany({ where: { createdAt: { gte: start, lte: end } }, select: { ip: true }, distinct: ["ip"] }),
      prisma.requestLog.aggregate({ where: { createdAt: { gte: start, lte: end }, durationMs: { not: null } }, _avg: { durationMs: true } }),
      prisma.requestLog.count({ where: { createdAt: { gte: start, lte: end }, statusCode: { gte: 400 } } }),
      prisma.requestLog.count({ where: { createdAt: { gte: start, lte: end }, statusCode: { not: null } } }),
      getRecentActivity(8),
    ]);

  const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

  const kpiCards = [
    { label: "Bài viết tin tức", value: newsCount, previousValue: newsCountPrev, href: "/admin/news", icon: "fa-solid fa-newspaper", iconColor: "text-brand-blue", iconBg: "bg-sky-50" },
    { label: "Sale đang chạy", value: saleCount, previousValue: saleCountPrev, href: "/admin/sales", icon: "fa-solid fa-tag", iconColor: "text-brand-green", iconBg: "bg-brand-greenBg" },
    { label: "Địa điểm quản lý", value: placeCount, previousValue: placeCountPrev, href: "/admin/places", icon: "fa-solid fa-location-dot", iconColor: "text-brand-orange", iconBg: "bg-amber-50" },
    { label: "Tổng đánh giá", value: reviewCount, previousValue: reviewCountPrev, href: "/admin/reviews", icon: "fa-solid fa-star", iconColor: "text-brand-purple", iconBg: "bg-brand-purpleBg" },
    { label: "Thành viên", value: userCount, previousValue: userCountPrev, href: "/admin/users", icon: "fa-solid fa-users", iconColor: "text-brand-blue", iconBg: "bg-sky-50" },
    { label: "Bài đăng diễn đàn", value: forumPostCount, previousValue: forumPostCountPrev, href: "/admin/forum", icon: "fa-solid fa-comments", iconColor: "text-brand-green", iconBg: "bg-brand-greenBg" },
    { label: "Bình luận diễn đàn", value: forumCommentCount, previousValue: forumCommentCountPrev, href: "/admin/forum-comments", icon: "fa-solid fa-comment-dots", iconColor: "text-brand-orange", iconBg: "bg-amber-50" },
  ];

  const securityCards = [
    { label: "Lượt truy cập", value: visits, previousValue: visitsPrev, icon: "fa-solid fa-eye", iconColor: "text-brand-blue", iconBg: "bg-sky-50" },
    { label: "Đang online (5 phút)", value: onlineIps.length, icon: "fa-solid fa-circle text-[8px]", iconColor: "text-brand-green", iconBg: "bg-brand-greenBg" },
    { label: "IP duy nhất", value: uniqueIps.length, icon: "fa-solid fa-user", iconColor: "text-brand-purple", iconBg: "bg-brand-purpleBg" },
    {
      label: "Cảnh báo bất thường",
      value: suspiciousCount,
      previousValue: suspiciousCountPrev,
      icon: "fa-solid fa-triangle-exclamation",
      iconColor: "text-brand-red",
      iconBg: "bg-brand-redBg",
      variant: "warning" as const,
    },
  ];

  return (
    <div id="hoat-dong">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-1">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-[28px] text-slate-800">Tổng quan</h1>
          <p className="text-slate-400 mt-1">Chào mừng bạn trở lại! Đây là tình hình hoạt động của hệ thống Booking Phan Thiết.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/news/new" className="flex items-center gap-1.5 bg-brand-blue hover:brightness-95 transition text-white text-sm font-bold rounded-lg px-4 py-2">
            <i className="fa-solid fa-plus text-xs" aria-hidden="true" /> Thêm bài viết
          </Link>
          <Link href="/admin/places/new" className="flex items-center gap-1.5 border border-sky-200 text-brand-blue hover:bg-sky-50 transition text-sm font-bold rounded-lg px-4 py-2">
            <i className="fa-solid fa-plus text-xs" aria-hidden="true" /> Thêm địa điểm
          </Link>
          <Link href="/admin/sales" className="flex items-center gap-1.5 border border-sky-200 text-brand-blue hover:bg-sky-50 transition text-sm font-bold rounded-lg px-4 py-2">
            <i className="fa-solid fa-tag text-xs" aria-hidden="true" /> Quản lý sale
          </Link>
          <a href="#hoat-dong" className="flex items-center gap-1.5 border border-sky-200 text-brand-blue hover:bg-sky-50 transition text-sm font-bold rounded-lg px-4 py-2">
            <i className="fa-solid fa-list text-xs" aria-hidden="true" /> Xem log
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6 mb-8">
        {kpiCards.map((c) => (
          <StatCard key={c.label} {...c} compareLabel={compareLabel} />
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-shield-halved text-brand-blue" aria-hidden="true" />
          <h2 className="font-display font-bold text-xl text-slate-800">Giám sát &amp; Bảo mật</h2>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-brand-green">
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-green opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-green" />
          </span>
          Hệ thống đang hoạt động · Đang xem: {rangeLabel}
        </span>
      </div>
      <p className="text-slate-400 mb-4 text-sm">
        Theo dõi lượt truy cập, vị trí IP khách và phát hiện hành vi bất thường (dò quét lỗ hổng, request bất thường tốc độ cao...).
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {securityCards.map((c) => (
          <StatCard key={c.label} {...c} compareLabel={compareLabel} />
        ))}
      </div>

      <TrafficSection />

      <div className="grid lg:grid-cols-[30%_45%_25%] gap-5 min-w-0">
        <div className="bg-white rounded-2xl shadow-card p-5 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-clock-rotate-left text-brand-blue" aria-hidden="true" /> Hoạt động gần đây
            </h3>
          </div>
          {activity.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm font-semibold text-slate-500">Chưa có hoạt động nào</p>
              <p className="text-xs text-slate-400 mt-1">Các hoạt động mới của hệ thống sẽ xuất hiện tại đây.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {activity.map((a) => (
                <Link key={a.id} href={a.href} className="flex items-start gap-2.5 group">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${TYPE_COLOR[a.type]}`}>
                    <i className={`${TYPE_ICON[a.type]} text-xs`} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-brand-blue transition truncate">{a.title}</p>
                    <p className="text-xs text-slate-400 truncate">{a.description}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{timeAgo(a.timestamp)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <SecurityAlertTable />

        <div className="bg-white rounded-2xl shadow-card p-5 min-w-0">
          <h3 className="font-display font-bold text-slate-800 mb-3">Hiệu suất hệ thống</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-100 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <i className="fa-regular fa-clock" aria-hidden="true" /> Phản hồi TB
              </p>
              <p className="font-display font-extrabold text-lg text-slate-800">
                {avgDuration._avg.durationMs ? Math.round(avgDuration._avg.durationMs) : "—"}
                {avgDuration._avg.durationMs ? " ms" : ""}
              </p>
            </div>
            <div className="border border-slate-100 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" /> Tỷ lệ lỗi
              </p>
              <p className="font-display font-extrabold text-lg text-slate-800">{errorRate.toFixed(2)}%</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <i className="fa-solid fa-shield" aria-hidden="true" /> Máy chủ
              </p>
              <p className="font-display font-extrabold text-sm text-brand-green">Đang chạy</p>
            </div>
            <div className="border border-slate-100 rounded-xl p-3">
              <p className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                <i className="fa-solid fa-server" aria-hidden="true" /> Số request
              </p>
              <p className="font-display font-extrabold text-lg text-slate-800">{totalRequests.toLocaleString("vi-VN")}</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 mt-3">
            * Thời gian phản hồi/tỷ lệ lỗi đo trực tiếp từ request thật trong khoảng "{rangeLabel}". Uptime lịch sử cần thêm thời gian thu thập để hiển thị chính xác.
          </p>
        </div>
      </div>
    </div>
  );
}
