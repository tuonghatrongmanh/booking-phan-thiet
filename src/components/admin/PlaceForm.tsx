"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";

const CATEGORIES = [
  { value: "HOMESTAY", label: "Homestay" },
  { value: "CAR_RENTAL", label: "Thuê xe" },
  { value: "RESTAURANT", label: "Quán ăn" },
  { value: "ATTRACTION", label: "Điểm tham quan" },
];

const STATUSES = [
  { value: "TRUSTED", label: "Uy tín" },
  { value: "WARNING", label: "Cần cẩn trọng" },
  { value: "SCAM", label: "Đã ghi nhận lừa đảo" },
];

function extractYoutubeId(url: string): string | null {
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,15})/);
  if (match) return match[1];
  return /^[A-Za-z0-9_-]{6,20}$/.test(trimmed) ? trimmed : null;
}

type PlaceInitial = {
  id?: string;
  name: string;
  category: string;
  status: string;
  avatar: string | null;
  address: string | null;
  phone: string | null;
  fanpageUrl: string | null;
  zaloUrl: string | null;
  description: string | null;
  featuredRank: number | null;
  stayType?: string | null;
  priceFromVnd?: number | null;
  distanceToBeachM?: number | null;
  openingHours?: string | null;
  distanceFromCenterKm?: number | null;
  amenities?: string[] | null;
  petFriendly?: boolean;
  totalRooms?: number | null;
  availableRooms?: number | null;
  mapEmbedUrl?: string | null;
  videoUrl?: string | null;
  videoCaption?: string | null;
  vehicleType?: string | null;
  priceHolidayVnd?: number | null;
  returnLocation?: string | null;
  coverImage?: string | null;
  roleTitle?: string | null;
  slogan?: string | null;
  workArea?: string | null;
  yearsExperience?: number | null;
  clientsServedCount?: number | null;
  tiktokUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
};

export default function PlaceForm({
  initial,
  lockCategory,
  stayTypes = [],
  amenityOptions = [],
}: {
  initial?: PlaceInitial;
  lockCategory?: "SALE" | "ATTRACTION" | "CAR_RENTAL";
  stayTypes?: { id: string; label: string }[];
  amenityOptions?: string[];
}) {
  const router = useRouter();
  const isEdit = Boolean(initial?.id);

  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(lockCategory ?? initial?.category ?? "HOMESTAY");
  const [status, setStatus] = useState(initial?.status ?? "TRUSTED");
  const [avatar, setAvatar] = useState(initial?.avatar ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [fanpageUrl, setFanpageUrl] = useState(initial?.fanpageUrl ?? "");
  const [zaloUrl, setZaloUrl] = useState(initial?.zaloUrl ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [featuredRank, setFeaturedRank] = useState(initial?.featuredRank?.toString() ?? "");
  const [stayType, setStayType] = useState(initial?.stayType ?? "");
  const [priceFromVnd, setPriceFromVnd] = useState(initial?.priceFromVnd?.toString() ?? "");
  const [distanceToBeachM, setDistanceToBeachM] = useState(initial?.distanceToBeachM?.toString() ?? "");
  const [openingHours, setOpeningHours] = useState(initial?.openingHours ?? "");
  const [distanceFromCenterKm, setDistanceFromCenterKm] = useState(initial?.distanceFromCenterKm?.toString() ?? "");
  const [amenities, setAmenities] = useState<string[]>(initial?.amenities ?? []);
  const [petFriendly, setPetFriendly] = useState(initial?.petFriendly ?? false);
  const [totalRooms, setTotalRooms] = useState(initial?.totalRooms?.toString() ?? "");
  const [availableRooms, setAvailableRooms] = useState(initial?.availableRooms?.toString() ?? "");
  const [mapEmbedUrl, setMapEmbedUrl] = useState(initial?.mapEmbedUrl ?? "");
  const [videoUrl, setVideoUrl] = useState(initial?.videoUrl ?? "");
  const [videoCaption, setVideoCaption] = useState(initial?.videoCaption ?? "");
  const [vehicleType, setVehicleType] = useState(initial?.vehicleType ?? "");
  const [priceHolidayVnd, setPriceHolidayVnd] = useState(initial?.priceHolidayVnd?.toString() ?? "");
  const [returnLocation, setReturnLocation] = useState(initial?.returnLocation ?? "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? "");
  const [roleTitle, setRoleTitle] = useState(initial?.roleTitle ?? "");
  const [slogan, setSlogan] = useState(initial?.slogan ?? "");
  const [workArea, setWorkArea] = useState(initial?.workArea ?? "");
  const [yearsExperience, setYearsExperience] = useState(initial?.yearsExperience?.toString() ?? "");
  const [clientsServedCount, setClientsServedCount] = useState(initial?.clientsServedCount?.toString() ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(initial?.tiktokUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(initial?.youtubeUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(initial?.instagramUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function toggleAmenity(a: string) {
    setAmenities((cur) => (cur.includes(a) ? cur.filter((x) => x !== a) : [...cur, a]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name,
      category,
      status,
      address: address || undefined,
      phone: phone || undefined,
      fanpageUrl: fanpageUrl || undefined,
      zaloUrl: zaloUrl || undefined,
      description: description || undefined,
      avatar: avatar || undefined,
      ...(isEdit ? { featuredRank: featuredRank.trim() === "" ? null : Number(featuredRank) } : {}),
      stayType: stayType === "" ? null : stayType,
      priceFromVnd: priceFromVnd.trim() === "" ? null : Number(priceFromVnd),
      distanceToBeachM: distanceToBeachM.trim() === "" ? null : Number(distanceToBeachM),
      openingHours: openingHours.trim() === "" ? null : openingHours.trim(),
      distanceFromCenterKm: distanceFromCenterKm.trim() === "" ? null : Number(distanceFromCenterKm),
      amenities,
      petFriendly,
      totalRooms: totalRooms.trim() === "" ? null : Number(totalRooms),
      availableRooms: availableRooms.trim() === "" ? null : Number(availableRooms),
      mapEmbedUrl: mapEmbedUrl.trim() === "" ? null : mapEmbedUrl.trim(),
      videoUrl: videoUrl.trim() === "" ? null : extractYoutubeId(videoUrl),
      videoCaption: videoCaption.trim() === "" ? null : videoCaption.trim(),
      vehicleType: vehicleType === "" ? null : vehicleType,
      priceHolidayVnd: priceHolidayVnd.trim() === "" ? null : Number(priceHolidayVnd),
      returnLocation: returnLocation.trim() === "" ? null : returnLocation.trim(),
      coverImage: coverImage.trim() === "" ? null : coverImage.trim(),
      roleTitle: roleTitle.trim() === "" ? null : roleTitle.trim(),
      slogan: slogan.trim() === "" ? null : slogan.trim(),
      workArea: workArea.trim() === "" ? null : workArea.trim(),
      yearsExperience: yearsExperience.trim() === "" ? null : Number(yearsExperience),
      clientsServedCount: clientsServedCount.trim() === "" ? null : Number(clientsServedCount),
      tiktokUrl: tiktokUrl.trim() === "" ? null : tiktokUrl.trim(),
      youtubeUrl: youtubeUrl.trim() === "" ? null : youtubeUrl.trim(),
      instagramUrl: instagramUrl.trim() === "" ? null : instagramUrl.trim(),
    };

    const res = await fetch(isEdit ? `/api/places/${initial!.id}` : "/api/places", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Có lỗi xảy ra, vui lòng kiểm tra lại các trường");
      return;
    }

    if (isEdit) {
      router.refresh();
    } else if (lockCategory === "SALE") {
      router.push("/admin/sale-agents");
    } else if (lockCategory === "CAR_RENTAL") {
      router.push(`/admin/car-rentals/${data.id}/edit`);
    } else if (lockCategory === "ATTRACTION") {
      router.push(`/admin/attractions/${data.id}/edit`);
    } else {
      router.push(`/admin/places/${data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card p-6 space-y-5 max-w-2xl">
      <ImageUploader label="Ảnh đại diện (avatar)" value={avatar} onChange={setAvatar} folder="places/avatar" />

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên địa điểm</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Mai Phương Homestay"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {!lockCategory && (
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Trạng thái uy tín</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isEdit && (
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">
            Thứ hạng "được yêu thích" (superAdmin ghim ở diễn đàn Nghỉ dưỡng)
          </label>
          <input
            type="number"
            value={featuredRank}
            onChange={(e) => setFeaturedRank(e.target.value)}
            className="w-full sm:w-48 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="Để trống = xếp tự động theo đánh giá"
          />
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="0945 123 456"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Địa chỉ</label>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="123 Nguyễn Đình Chiểu, Mũi Né"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link Fanpage</label>
          <input
            value={fanpageUrl}
            onChange={(e) => setFanpageUrl(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link Zalo</label>
          <input
            value={zaloUrl}
            onChange={(e) => setZaloUrl(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="https://zalo.me/..."
          />
        </div>
      </div>

      {category === "HOMESTAY" && (
      <div className="border-t border-slate-100 pt-5">
        <p className="text-[13px] font-bold text-slate-600 mb-3">Thông tin riêng cho trang "Lưu trú" (chỉ áp dụng khi danh mục là Homestay)</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Loại hình</label>
            <select
              value={stayType}
              onChange={(e) => setStayType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            >
              <option value="">— Không chọn —</option>
              {stayTypes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giá khởi điểm / đêm (VNĐ)</label>
            <input
              type="number"
              min={0}
              value={priceFromVnd}
              onChange={(e) => setPriceFromVnd(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="450000"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Khoảng cách tới biển (mét)</label>
            <input
              type="number"
              min={0}
              value={distanceToBeachM}
              onChange={(e) => setDistanceToBeachM(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="200"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giờ mở cửa</label>
            <input
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="07:00 - 18:00"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Khoảng cách từ trung tâm Phan Thiết (km)</label>
            <input
              type="number"
              min={0}
              step="0.1"
              value={distanceFromCenterKm}
              onChange={(e) => setDistanceFromCenterKm(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="45"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[13px] text-slate-500 font-medium mb-2 block">Tiện ích</label>
          <div className="flex flex-wrap gap-2">
            {amenityOptions.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`text-[13px] font-semibold px-3 py-1.5 rounded-full border transition ${
                  amenities.includes(a)
                    ? "bg-brand-blue text-white border-brand-blue"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-[14px] text-slate-600 font-medium cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={petFriendly}
            onChange={(e) => setPetFriendly(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-brand-blue focus:ring-brand-blue/40"
          />
          Cho phép mang thú cưng (pet-friendly)
        </label>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tổng số phòng</label>
            <input
              type="number"
              min={0}
              value={totalRooms}
              onChange={(e) => setTotalRooms(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="10"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số phòng còn trống</label>
            <input
              type="number"
              min={0}
              value={availableRooms}
              onChange={(e) => setAvailableRooms(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="3"
            />
          </div>
        </div>

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link nhúng Google Maps</label>
          <input
            value={mapEmbedUrl}
            onChange={(e) => setMapEmbedUrl(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="text-xs text-slate-400 mt-1">
            Vào Google Maps → tìm địa điểm → Chia sẻ → Nhúng bản đồ → Sao chép đường link trong thuộc tính src của thẻ iframe, dán vào đây.
          </p>
        </div>
      </div>
      )}

      {category === "ATTRACTION" && (
      <div className="border-t border-slate-100 pt-5">
        <p className="text-[13px] font-bold text-slate-600 mb-3">Thông tin riêng cho trang chi tiết Điểm tham quan</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giờ mở cửa</label>
            <input
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="06:00 - 18:00 hằng ngày"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giá vé / Chi phí tham khảo</label>
            <input
              type="number"
              min={0}
              value={priceFromVnd}
              onChange={(e) => setPriceFromVnd(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Để trống nếu miễn phí"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link nhúng Google Maps</label>
          <input
            value={mapEmbedUrl}
            onChange={(e) => setMapEmbedUrl(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
          <p className="text-xs text-slate-400 mt-1">
            Vào Google Maps → tìm địa điểm → Chia sẻ → Nhúng bản đồ → Sao chép đường link trong thuộc tính src của thẻ iframe, dán vào đây.
          </p>
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
              placeholder="Flycam toàn cảnh..."
            />
          </div>
        </div>
      </div>
      )}

      {category === "CAR_RENTAL" && (
      <div className="border-t border-slate-100 pt-5">
        <p className="text-[13px] font-bold text-slate-600 mb-3">Thông tin riêng cho trang "Thuê xe"</p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Loại xe</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            >
              <option value="">— Chọn loại xe —</option>
              <option value="Xe số 50cc">Xe số 50cc</option>
              <option value="Xe tay ga">Xe tay ga</option>
              <option value="Xe Vision">Xe Vision</option>
              <option value="Xe cào cào">Xe cào cào</option>
              <option value="Xe SH">Xe SH</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số lượng xe còn trống / tổng số xe</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={availableRooms}
                onChange={(e) => setAvailableRooms(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="Còn trống"
              />
              <span className="text-slate-400 text-sm">/</span>
              <input
                type="number"
                min={0}
                value={totalRooms}
                onChange={(e) => setTotalRooms(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
                placeholder="Tổng số"
              />
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giá thuê ngày thường (VNĐ/ngày)</label>
            <input
              type="number"
              min={0}
              value={priceFromVnd}
              onChange={(e) => setPriceFromVnd(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="120000"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Giá thuê ngày lễ / cuối tuần (VNĐ/ngày)</label>
            <input
              type="number"
              min={0}
              value={priceHolidayVnd}
              onChange={(e) => setPriceHolidayVnd(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="150000"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Quy định check-in / check-out</label>
          <textarea
            rows={2}
            value={openingHours}
            onChange={(e) => setOpeningHours(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder={"Nhận xe: xuất trình CCCD/hộ chiếu + đặt cọc 2.000.000đ hoặc xe máy\nTrả xe: đúng giờ, đủ xăng như lúc nhận"}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Địa điểm nhận xe</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="123 Nguyễn Đình Chiểu, Mũi Né"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Địa điểm trả xe (để trống nếu giống nơi nhận)</label>
            <input
              value={returnLocation}
              onChange={(e) => setReturnLocation(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Để trống nếu giống địa điểm nhận xe"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-[13px] text-slate-500 font-medium mb-2 block">Tiện ích kèm theo</label>
          <div className="flex flex-wrap gap-2">
            {["Mũ bảo hiểm", "Áo mưa", "Bản đồ giấy", "Sạc điện thoại", "Khóa chống trộm", "Giao xe tận nơi", "Bảo hiểm xe"].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`text-[13px] font-semibold px-3 py-1.5 rounded-full border transition ${
                  amenities.includes(a)
                    ? "bg-brand-blue text-white border-brand-blue"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link nhúng Google Maps</label>
          <input
            value={mapEmbedUrl}
            onChange={(e) => setMapEmbedUrl(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
        </div>
      </div>
      )}

      {category === "SALE" && (
      <div className="border-t border-slate-100 pt-5">
        <p className="text-[13px] font-bold text-slate-600 mb-3">Thông tin riêng cho hồ sơ "Sale uy tín"</p>

        <div className="mb-4">
          <ImageUploader label="Ảnh banner (hero)" value={coverImage} onChange={setCoverImage} folder="places/cover" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Chuyên môn / vai trò</label>
            <input
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Chuyên tư vấn Homestay - Villa - Resort Phan Thiết"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Slogan</label>
            <input
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Luôn đặt trải nghiệm của bạn lên hàng đầu..."
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Khu vực hoạt động</label>
            <input
              value={workArea}
              onChange={(e) => setWorkArea(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="Phan Thiết - Mũi Né"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số năm kinh nghiệm</label>
            <input
              type="number"
              min={0}
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="3"
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số khách đã tư vấn</label>
            <input
              type="number"
              min={0}
              value={clientsServedCount}
              onChange={(e) => setClientsServedCount(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="1200"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link TikTok</label>
            <input
              value={tiktokUrl}
              onChange={(e) => setTiktokUrl(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="https://www.tiktok.com/@..."
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link YouTube</label>
            <input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="https://www.youtube.com/@..."
            />
          </div>
          <div>
            <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link Instagram</label>
            <input
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      </div>
      )}

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Mô tả{category === "SALE" ? " (Về tôi)" : ""}</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          placeholder="Giới thiệu ngắn về địa điểm..."
        />
      </div>

      {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo địa điểm"}
        </button>
        <button
          type="button"
          onClick={() =>
            router.push(
              lockCategory === "SALE"
                ? "/admin/sale-agents"
                : lockCategory === "ATTRACTION"
                  ? "/admin/attractions"
                  : lockCategory === "CAR_RENTAL"
                    ? "/admin/car-rentals"
                    : "/admin/places"
            )
          }
          className="text-slate-500 font-semibold px-4 py-2.5 hover:bg-slate-50 rounded-xl"
        >
          {isEdit ? "Quay lại danh sách" : "Hủy"}
        </button>
      </div>
    </form>
  );
}
