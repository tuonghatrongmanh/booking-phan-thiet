"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useDialog } from "@/components/ui/DialogProvider";
import ImageUploader from "@/components/admin/ImageUploader";
import MediaUploader, { type MediaItem } from "@/components/forum/MediaUploader";

const MAX_VIDEOS = 6;
const MAX_TESTIMONIALS = 6;

type PlaceInfo = {
  avatar: string | null;
  coverImage: string | null;
  name: string;
  roleTitle: string | null;
  slogan: string | null;
  description: string | null;
  phone: string | null;
  workArea: string | null;
  yearsExperience: number | null;
  clientsServedCount: number | null;
  zaloUrl: string | null;
  fanpageUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
};

type PlaceVideo = { id: string; sourceUrl: string; title: string | null; thumbnailUrl: string | null };
type Testimonial = { id: string; imageUrl: string; authorName: string | null; platform: string };
type GuideVideo = { id: string; title: string; videoUrl: string; caption: string | null };

export default function SaleProfileEditor({
  place,
  videos,
  testimonials,
  guideVideos,
}: {
  place: PlaceInfo;
  videos: PlaceVideo[];
  testimonials: Testimonial[];
  guideVideos: GuideVideo[];
}) {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-xl text-slate-800">Hồ sơ Sale uy tín</h1>
          <Link href="/tai-khoan" className="text-sm font-semibold text-slate-400 hover:text-brand-blue transition">
            ← Quay lại trang tài khoản
          </Link>
        </div>

        <BasicFieldsCard place={place} />
        <VideosCard videos={videos} />
        <TestimonialsCard testimonials={testimonials} />
        {guideVideos.length > 0 && <GuideVideosCard guideVideos={guideVideos} />}
      </div>
    </div>
  );
}

function BasicFieldsCard({ place }: { place: PlaceInfo }) {
  const router = useRouter();
  const { toast } = useDialog();
  const [avatar, setAvatar] = useState(place.avatar ?? "");
  const [coverImage, setCoverImage] = useState(place.coverImage ?? "");
  const [name, setName] = useState(place.name);
  const [roleTitle, setRoleTitle] = useState(place.roleTitle ?? "");
  const [slogan, setSlogan] = useState(place.slogan ?? "");
  const [description, setDescription] = useState(place.description ?? "");
  const [phone, setPhone] = useState(place.phone ?? "");
  const [workArea, setWorkArea] = useState(place.workArea ?? "");
  const [yearsExperience, setYearsExperience] = useState(place.yearsExperience?.toString() ?? "");
  const [clientsServedCount, setClientsServedCount] = useState(place.clientsServedCount?.toString() ?? "");
  const [zaloUrl, setZaloUrl] = useState(place.zaloUrl ?? "");
  const [fanpageUrl, setFanpageUrl] = useState(place.fanpageUrl ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(place.tiktokUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(place.youtubeUrl ?? "");
  const [instagramUrl, setInstagramUrl] = useState(place.instagramUrl ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/sale-profile/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avatar: avatar || undefined,
        coverImage: coverImage || "",
        name,
        roleTitle: roleTitle || "",
        slogan: slogan || "",
        description: description || "",
        phone: phone || "",
        workArea: workArea || "",
        yearsExperience: yearsExperience.trim() === "" ? null : Number(yearsExperience),
        clientsServedCount: clientsServedCount.trim() === "" ? null : Number(clientsServedCount),
        zaloUrl: zaloUrl || "",
        fanpageUrl: fanpageUrl || "",
        tiktokUrl: tiktokUrl || "",
        youtubeUrl: youtubeUrl || "",
        instagramUrl: instagramUrl || "",
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Không thể lưu hồ sơ", "error");
      return;
    }
    toast("Đã lưu hồ sơ Sale uy tín", "success");
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 space-y-4">
      <p className="font-bold text-slate-700">Thông tin hồ sơ</p>

      <div className="grid sm:grid-cols-2 gap-4">
        <ImageUploader label="Avatar" value={avatar} onChange={setAvatar} folder="sale-profile/avatar" />
        <ImageUploader label="Ảnh banner (hero)" value={coverImage} onChange={setCoverImage} folder="sale-profile/cover" />
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Tên hiển thị</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Chuyên môn / vai trò</label>
          <input
            value={roleTitle}
            onChange={(e) => setRoleTitle(e.target.value)}
            placeholder="Chuyên tư vấn Homestay - Villa - Resort..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Slogan</label>
          <input
            value={slogan}
            onChange={(e) => setSlogan(e.target.value)}
            placeholder="Luôn đặt trải nghiệm của bạn lên hàng đầu..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Về tôi</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số điện thoại</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
          />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Khu vực hoạt động</label>
          <input
            value={workArea}
            onChange={(e) => setWorkArea(e.target.value)}
            placeholder="Phan Thiết - Mũi Né"
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
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
          />
        </div>
      </div>

      <div>
        <label className="text-[13px] text-slate-500 font-medium mb-1 block">Số khách đã tư vấn</label>
        <input
          type="number"
          min={0}
          value={clientsServedCount}
          onChange={(e) => setClientsServedCount(e.target.value)}
          className="w-full sm:w-1/3 border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link Zalo</label>
          <input value={zaloUrl} onChange={(e) => setZaloUrl(e.target.value)} placeholder="https://zalo.me/..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40" />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link Facebook</label>
          <input value={fanpageUrl} onChange={(e) => setFanpageUrl(e.target.value)} placeholder="https://facebook.com/..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40" />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link TikTok</label>
          <input value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} placeholder="https://www.tiktok.com/@..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40" />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link YouTube</label>
          <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} placeholder="https://www.youtube.com/@..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40" />
        </div>
        <div>
          <label className="text-[13px] text-slate-500 font-medium mb-1 block">Link Instagram</label>
          <input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} placeholder="https://instagram.com/..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-blue/40" />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}

function VideosCard({ videos }: { videos: PlaceVideo[] }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [sourceUrl, setSourceUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const full = videos.length >= MAX_VIDEOS;

  async function handleAdd() {
    if (!sourceUrl.trim()) return;
    setSaving(true);
    setError(null);

    const res = await fetch("/api/sale-profile/me/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceUrl: sourceUrl.trim() }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.error === "string" ? data.error : "Không thể thêm video");
      return;
    }
    setSourceUrl("");
    router.refresh();
  }

  async function handleDelete(videoId: string) {
    if (!(await confirm("Xóa video này?"))) return;
    const res = await fetch(`/api/sale-profile/me/videos/${videoId}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Không thể xóa video", "error");
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
        <i className="fa-brands fa-tiktok" aria-hidden="true" /> Video review &amp; chia sẻ từ mình
      </p>
      <p className="text-xs text-slate-400 mb-4">Dán link video TikTok — hệ thống tự lấy ảnh thumbnail + tiêu đề thật. Tối đa {MAX_VIDEOS} video.</p>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        {videos.map((v) => (
          <div key={v.id} className="border border-slate-100 rounded-xl overflow-hidden">
            <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full aspect-[9/16] bg-slate-100">
              {v.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                  <i className="fa-brands fa-tiktok text-2xl" aria-hidden="true" />
                </div>
              )}
            </a>
            <div className="p-2 flex items-center justify-between gap-2">
              <p className="text-xs text-slate-600 line-clamp-2">{v.title || v.sourceUrl}</p>
              <button onClick={() => handleDelete(v.id)} className="text-brand-red text-xs font-bold hover:bg-brand-redBg rounded px-2 py-1 shrink-0">
                Xóa
              </button>
            </div>
          </div>
        ))}
        {videos.length === 0 && <p className="col-span-full text-sm text-slate-400">Chưa có video nào.</p>}
      </div>

      <div className="border-t border-slate-100 pt-4 space-y-3">
        <input
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          disabled={full}
          placeholder="https://www.tiktok.com/@..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 disabled:bg-slate-50"
        />
        {full && <p className="text-xs text-amber-600">Đã đủ {MAX_VIDEOS} video — xoá 1 video trước khi thêm mới.</p>}
        {error && <p className="text-xs text-brand-red">{error}</p>}
        <button
          onClick={handleAdd}
          disabled={!sourceUrl.trim() || saving || full}
          className="text-sm font-bold text-white bg-brand-blue hover:brightness-95 transition rounded-lg px-4 py-2 disabled:opacity-50"
        >
          {saving ? "Đang thêm..." : "+ Thêm video"}
        </button>
      </div>
    </div>
  );
}

function TestimonialsCard({ testimonials }: { testimonials: Testimonial[] }) {
  const router = useRouter();
  const { confirm, toast } = useDialog();
  const [saving, setSaving] = useState(false);

  const remaining = MAX_TESTIMONIALS - testimonials.length;
  const full = remaining <= 0;

  async function handleUpload(item: MediaItem) {
    if (item.type !== "IMAGE") return;
    setSaving(true);
    const res = await fetch("/api/sale-profile/me/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: item.url, platform: "ZALO", authorName: "Khách hàng" }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast(typeof data.error === "string" ? data.error : "Không thể thêm ảnh", "error");
      return;
    }
    router.refresh();
  }

  async function handleDelete(commentId: string) {
    if (!(await confirm("Xóa ảnh này?"))) return;
    const res = await fetch(`/api/sale-profile/me/testimonials/${commentId}`, { method: "DELETE" });
    if (!res.ok) {
      toast("Không thể xóa ảnh", "error");
      return;
    }
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-comment-dots" aria-hidden="true" /> Khách hàng nói gì về mình
      </p>
      <p className="text-xs text-slate-400 mb-4">Tải ảnh chụp màn hình tin nhắn/bình luận khen của khách hàng. Tối đa {MAX_TESTIMONIALS} ảnh.</p>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-4">
        {testimonials.map((t) => (
          <div key={t.id} className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 group">
            <Image src={t.imageUrl} alt="" fill className="object-cover" />
            <button
              onClick={() => handleDelete(t.id)}
              className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
              aria-label="Xóa ảnh"
            >
              ×
            </button>
          </div>
        ))}
        {testimonials.length === 0 && <p className="col-span-full text-sm text-slate-400">Chưa có ảnh nào.</p>}
      </div>

      {full ? (
        <p className="text-xs text-amber-600">Đã đủ {MAX_TESTIMONIALS} ảnh — xoá 1 ảnh trước khi thêm mới.</p>
      ) : (
        <MediaUploader onAdd={handleUpload} folder="sale-profile/testimonials" multiple max={remaining} />
      )}
      {saving && <p className="text-xs text-slate-400 mt-2">Đang lưu...</p>}
    </div>
  );
}

function GuideVideosCard({ guideVideos }: { guideVideos: GuideVideo[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6">
      <p className="font-bold text-slate-700 mb-1 flex items-center gap-2">
        <i className="fa-solid fa-circle-play" aria-hidden="true" /> Video hướng dẫn
      </p>
      <p className="text-xs text-slate-400 mb-4">Cách lấy link video TikTok, cách dùng hồ sơ Sale uy tín, và những điều cần tránh.</p>

      <div className="space-y-4">
        {guideVideos.map((g) => (
          <div key={g.id}>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-100">
              <iframe
                src={`https://www.youtube.com/embed/${g.videoUrl}`}
                title={g.title}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                allowFullScreen
              />
            </div>
            <p className="text-sm font-semibold text-slate-700 mt-2">{g.title}</p>
            {g.caption && <p className="text-xs text-slate-400">{g.caption}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
