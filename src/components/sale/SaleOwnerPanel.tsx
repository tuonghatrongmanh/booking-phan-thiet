"use client";

import { useState } from "react";
import { BasicFieldsCard, GuideVideosCard, TestimonialsCard, VideosCard } from "@/components/account/SaleProfileEditor";
import type { GuideVideo, PlaceInfo, PlaceVideo, Testimonial } from "@/components/account/SaleProfileEditor";
import SaleMissionsCard from "@/components/account/SaleMissionsCard";
import SaleTasksCard, { type MyTask } from "@/components/sale/SaleTasksCard";
import SaleReferralCard from "@/components/sale/SaleReferralCard";
import type { SaleReferralData } from "@/lib/sale-referral-data";

type Missions = { mission: { id: string; title: string; description: string; points: number }; done: boolean }[];

const TABS = [
  { key: "profile", label: "Chỉnh sửa hồ sơ", icon: "fa-solid fa-pen" },
  { key: "videos", label: "Video TikTok", icon: "fa-brands fa-tiktok" },
  { key: "feedback", label: "Ảnh khách khen", icon: "fa-solid fa-comment-dots" },
  { key: "referral", label: "Giới thiệu & hoa hồng", icon: "fa-solid fa-hand-holding-dollar" },
  { key: "rank", label: "Xếp hạng & nhiệm vụ", icon: "fa-solid fa-ranking-star" },
  { key: "guide", label: "Hướng dẫn", icon: "fa-solid fa-circle-play" },
] as const;

// Khu vực CHỈ CHỦ HỒ SƠ thấy, nằm ngay trên trang hồ sơ công khai: sửa tên/ảnh đại diện/ảnh bìa, thêm video TikTok
// (link hoặc mã nhúng), tải ảnh khách khen, xem xếp hạng, xin/nhận nhiệm vụ, xem video hướng dẫn.
export default function SaleOwnerPanel({
  place,
  videos,
  testimonials,
  guideVideos,
  points,
  missions,
  tasks,
  referral,
}: {
  place: PlaceInfo;
  videos: PlaceVideo[];
  testimonials: Testimonial[];
  guideVideos: GuideVideo[];
  points: number;
  missions: Missions;
  tasks: MyTask[];
  referral: SaleReferralData;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("profile");
  const pendingTasks = tasks.filter((t) => t.status === "ASSIGNED").length;

  return (
    <section id="khu-vuc-cua-ban" className="scroll-mt-28 mb-5 rounded-3xl border-2 border-dashed border-brand-blue/40 bg-white/80 backdrop-blur p-4 sm:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="w-10 h-10 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0">
          <i className="fa-solid fa-user-lock" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display font-bold text-lg text-slate-800">Khu vực của bạn</p>
          <p className="text-sm text-slate-500">Chỉ mình bạn nhìn thấy phần này. Khách xem hồ sơ của bạn ở phần bên dưới.</p>
        </div>
      </div>

      <div data-swipe-hint className="flex gap-2 overflow-x-auto scrollbar-none mb-4 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-pressed={tab === t.key}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border transition ${
              tab === t.key ? "bg-brand-blue text-white border-brand-blue" : "bg-white text-slate-600 border-slate-200 hover:bg-brand-tint"
            }`}
          >
            <i className={t.icon} aria-hidden="true" /> {t.label}
            {t.key === "rank" && pendingTasks > 0 && <span className="w-5 h-5 rounded-full bg-brand-red text-white text-[11px] flex items-center justify-center">{pendingTasks}</span>}
          </button>
        ))}
      </div>

      {tab === "profile" && <BasicFieldsCard place={place} />}
      {tab === "videos" && (
        <div className="space-y-4">
          <VideosCard videos={videos} />
          {guideVideos.length > 0 && <p className="text-sm text-slate-500">Chưa biết lấy mã nhúng TikTok? Mở mục <button type="button" onClick={() => setTab("guide")} className="font-bold text-brand-blue underline">Hướng dẫn</button>.</p>}
        </div>
      )}
      {tab === "feedback" && <TestimonialsCard testimonials={testimonials} />}
      {tab === "referral" && <SaleReferralCard data={referral} />}
      {tab === "rank" && (
        <div className="space-y-4">
          <SaleTasksCard tasks={tasks} />
          <SaleMissionsCard points={points} missions={missions} />
        </div>
      )}
      {tab === "guide" &&
        (guideVideos.length > 0 ? (
          <GuideVideosCard guideVideos={guideVideos} />
        ) : (
          <p className="text-sm text-slate-500 bg-white rounded-2xl p-5">Admin chưa thêm video hướng dẫn. Bạn liên hệ admin để được hỗ trợ lấy mã nhúng TikTok.</p>
        ))}
    </section>
  );
}
