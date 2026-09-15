"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { slugifyBase } from "@/lib/slug";
import type { FoodCategory } from "@prisma/client";

function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/);
  if (match) return match[1];
  return /^[A-Za-z0-9_-]{6,20}$/.test(trimmed) ? trimmed : null;
}

type FoodInitial = {
  id?: string;
  slug: string;
  name: string;
  restaurant: string;
  categoryId: string;
  image: string | null;
  description: string;
  content: string | null;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  unit: string;
  badge: string | null;
  mealTime: string | null;
  featured: boolean;
  verified: boolean;
  phone: string | null;
  googleMapsUrl: string | null;
  videoUrl: string | null;
  videoCaption: string | null;
  mapEmbedUrl: string | null;
  openingHours: string | null;
  is24h: boolean;
  fanpageUrl: string | null;
  websiteUrl: string | null;
  active: boolean;
  sortOrder: number;
};

export default function FoodForm({ initial, categories }: { initial?: FoodInitial; categories: FoodCategory[] }) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [restaurant, setRestaurant] = useState(initial?.restaurant ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? categories[0]?.id ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [rating, setRating] = useState(initial?.rating?.toString() ?? "4.8");
  const [reviewCount, setReviewCount] = useState(initial?.reviewCount?.toString() ?? "0");
  const [priceFrom, setPriceFrom] = useState(initial?.priceFrom?.toString() ?? "0");
  const [unit, setUnit] = useState(initial?.unit ?? "phần");
  const [badge, setBadge] = useState(initial?.badge ?? "");
  const [mealTimes, setMealTimes] = useState<string[]>(
    initial?.mealTime ? initial.mealTime.split(",").map((s) => s.trim()).filter(Boolean) : []
  );
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [verified, setVerified] = useState(initial?.verified ?? false);
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [googleMapsUrl, setGoogleMapsUrl] = useState(initial?.googleMapsUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [videoCaption, setVideoCaption] = useState(initial?.videoCaption ?? "");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial?.mapEmbedUrl ?? "");
  const [openingHours, setOpeningHours] = useState(initial?.openingHours ?? "");
  const [is24h, setIs24h] = useState(initial?.is24h ?? false);
  const [fanpageUrl, setFanpageUrl] = useState(initial?.fanpageUrl ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(initial?.websiteUrl ?? "");
  const [active, setActive] = useState(initial?.active ?? true);
  const [sortOrder, setSortOrder] = useState(initial?.sortOrder?.toString() ?? "0");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const displaySlug = slugTouched ? slug : slugifyBase(name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      slug: displaySlug,
      restaurant,
      categoryId,
      image: image || null,
      description,
      content: content || null,
      rating: Number(rating),
      reviewCount: Number(reviewCount),
      priceFrom: Number(priceFrom),
      unit,
      badge: badge || null,
      mealTime: mealTimes.length > 0 ? mealTimes.join(",") : null,
      featured,
      verified,
      phone: phone || null,
      googleMapsUrl: googleMapsUrl || null,
      videoUrl: videoUrl ? extractYoutubeId(videoUrl) : null,
      videoCaption: videoCaption || null,
      mapEmbedUrl: mapEmbedUrl || null,
      openingHours: openingHours || null,
      is24h,
      fanpageUrl: fanpageUrl || null,
      websiteUrl: websiteUrl || null,
      active,
      sortOrder: Number(sortOrder),
    };

    const res = await fetch(isEdit ? `/api/foods/${initial!.id}` : "/api/foods", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng kiểm tra lại các trường");
      return;
    }

    router.push("/admin/foods");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên món</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Tôm hùm nướng phô mai"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nhà hàng / quán</label>
            <input
              required
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Nhà hàng Hải Sản Kỳ Quán"
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Đường dẫn (slug)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 shrink-0">/am-thuc/mon/</span>
            <input
              value={displaySlug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugifyBase(e.target.value));
              }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
            {slugTouched && (
              <button
                type="button"
                onClick={() => {
                  setSlugTouched(false);
                  setSlug("");
                }}
                className="shrink-0 text-xs font-semibold text-brand-blue hover:underline"
              >
                Tự sinh lại
              </button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Danh mục</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Nhãn hiển thị trên ảnh (không bắt buộc)</label>
            <input
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Để trống sẽ dùng tên danh mục"
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1.5 block">
            Buổi ăn phục vụ (giúp AI hiểu ngữ cảnh khi khách hỏi - có thể chọn nhiều)
          </label>
          <div className="flex flex-wrap gap-2">
            {["Sáng", "Trưa", "Chiều", "Tối"].map((t) => {
              const checked = mealTimes.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() =>
                    setMealTimes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
                  }
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                    checked
                      ? "bg-brand-blue text-white border-brand-blue"
                      : "bg-white text-slate-600 border-slate-200 hover:border-brand-blue/50"
                  }`}
                >
                  {checked && <i className="fa-solid fa-check mr-1.5" aria-hidden="true" />}
                  {t}
                </button>
              );
            })}
          </div>
          {mealTimes.length === 0 && (
            <p className="text-xs text-slate-400 mt-1.5">
              Chưa chọn buổi nào - AI sẽ coi món này là chưa phân loại, không dùng để gợi ý khi khách hỏi theo buổi ăn cụ thể.
            </p>
          )}
        </div>

        <ImageUploader label="Ảnh đại diện (hiển thị trên card)" value={image} onChange={setImage} folder="am-thuc" />

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả ngắn (hiển thị trên card)</label>
          <textarea
            required
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
        <h2 className="font-display font-bold text-lg text-slate-800">Bài viết chi tiết</h2>
        <p className="text-[13px] text-slate-400">
          Hiển thị ở trang chi tiết món ăn. Có thể chèn ảnh, gallery, video YouTube và trích dẫn khách hàng bằng thanh công cụ dưới đây.
        </p>
        <RichTextEditor value={content} onChange={setContent} uploadFolder="am-thuc" />
      </div>

      <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
        <div className="grid sm:grid-cols-4 gap-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Đánh giá (0-5)</label>
            <input
              type="number"
              step="0.1"
              min={0}
              max={5}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số lượt đánh giá</label>
            <input
              type="number"
              min={0}
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giá từ (VNĐ)</label>
            <input
              required
              type="number"
              min={0}
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Đơn vị</label>
            <input
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="phần, con, nồi, ly..."
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại (không bắt buộc)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="0912 345 001"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link Google Maps (không bắt buộc)</label>
            <input
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Để trống sẽ tự tạo link tìm kiếm theo tên quán"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5 space-y-4">
          <p className="text-sm font-bold text-slate-700">Thông tin trang chi tiết</p>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Website (không bắt buộc)</label>
              <input
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Fanpage (không bắt buộc)</label>
              <input
                value={fanpageUrl}
                onChange={(e) => setFanpageUrl(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link nhúng Google Maps (không bắt buộc)</label>
            <input
              value={mapEmbedUrl}
              onChange={(e) => setMapEmbedUrl(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
              <input type="checkbox" checked={is24h} onChange={(e) => setIs24h(e.target.checked)} className="w-4 h-4" />
              Quán mở cửa 24/24 (giúp AI/khách biết chắc chắn thay vì đoán từ giờ mở cửa ghi tự do)
            </label>
          </div>

          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giờ mở cửa (không bắt buộc)</label>
            <textarea
              rows={2}
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder={"Thứ 2 - Thứ 6: 10:00 - 22:00\nThứ 7 - CN: 09:00 - 23:00"}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link video YouTube (không bắt buộc)</label>
              <input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div>
              <label className="text-[13px] text-slate-500 font-medium mb-1 block">Chú thích video</label>
              <input
                value={videoCaption}
                onChange={(e) => setVideoCaption(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="Review thực tế món ..."
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Thứ tự hiển thị</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full sm:w-40 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>

        <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="w-4 h-4" />
            Hiển thị trên trang ẩm thực
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="w-4 h-4" />
            Đã kiểm duyệt bởi Admin
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4" />
            Nổi bật (AI ưu tiên gợi ý khi khách hỏi chung chung)
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm món ăn"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl"
        >
          Hủy
        </button>
      </div>
    </form>
  );
}
