"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MediaUploader from "./MediaUploader";
import HighlightedTextarea from "./HighlightedTextarea";
import { uploadFile, type MediaItem } from "@/lib/upload-client";
import { FORUM_CATEGORIES, POST_TYPES, type PostTypeKey, type ForumSlug } from "@/lib/forum";

const TYPE_KEYS = (Object.keys(POST_TYPES) as PostTypeKey[]).filter((k) => k !== "QUESTION");
const MAX_MEDIA = 8;

export default function ForumPostForm({
  categorySlug,
  currentUser,
}: {
  categorySlug: string;
  currentUser: { name: string; avatar: string | null } | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [postType, setPostType] = useState<PostTypeKey>("POST");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [pasteUploading, setPasteUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const categoryLabel = FORUM_CATEGORIES[categorySlug as ForumSlug]?.label ?? "";

  function resetFields() {
    setTitle("");
    setContent("");
    setMedia([]);
    setPostType("POST");
    setError(null);
  }

  function closeModal() {
    resetFields();
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handlePasteFiles(files: File[]) {
    if (media.length >= MAX_MEDIA) return;
    setPasteUploading(true);
    setError(null);
    try {
      const room = MAX_MEDIA - media.length;
      const items = await Promise.all(files.slice(0, room).map((f) => uploadFile(f, "forum")));
      setMedia((cur) => [...cur, ...items]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setPasteUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Kieu Facebook: dong modal + reset form NGAY, hien 1 toast noi "dang dang bai
    // viet..." o goc man hinh thay vi bat nguoi dung cho ket qua fetch moi duoc thao tac
    // tiep. Bai viet that su se tu hien vao dau feed qua realtime (xem ForumFeed) khi
    // server tao xong (thuong chi vai giay).
    const payload = { category: categorySlug, title, content, postType, media };
    closeModal();
    setPosting(true);
    setPostError(null);

    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPosting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setPostError(typeof data.error === "string" ? data.error : "Đăng bài thất bại, vui lòng thử lại");
      return;
    }

    router.refresh();
  }

  const canSubmit = title.trim().length >= 3 && content.trim().length >= 5;

  const avatar = (size: number) => (
    <span
      className="relative rounded-full overflow-hidden bg-brand-sky flex items-center justify-center text-brand-blue shrink-0"
      style={{ width: size, height: size }}
    >
      {currentUser?.avatar ? (
        <Image src={currentUser.avatar} alt="" fill className="object-cover" />
      ) : (
        <i className="fa-solid fa-user" aria-hidden="true" />
      )}
    </span>
  );

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card p-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 text-left hover:bg-slate-50 rounded-xl p-1.5 transition"
        >
          {avatar(36)}
          <span className="text-slate-400 text-sm font-medium flex-1 bg-slate-50 rounded-full px-4 py-2.5">
            Bạn đang nghĩ gì? Chia sẻ trải nghiệm của bạn...
          </span>
        </button>

        <div className="flex items-center justify-around mt-3 pt-3 border-t border-slate-100">
          <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg px-3 py-1.5">
            <i className="fa-solid fa-photo-film text-brand-purple" aria-hidden="true" /> Ảnh/Video
          </button>
          <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg px-3 py-1.5">
            <i className="fa-solid fa-comment-dots text-brand-blue" aria-hidden="true" /> Cảm nhận
          </button>
        </div>
      </div>

      {posting && (
        <div className="fixed bottom-5 right-5 z-[90] bg-white rounded-xl shadow-xl border border-slate-200 px-4 py-3 flex items-center gap-3 animate-fade-up max-w-xs">
          {avatar(36)}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800">Đang đăng bài viết...</p>
            <p className="text-xs text-slate-400">Bài viết sẽ xuất hiện trong giây lát</p>
          </div>
          <i className="fa-solid fa-spinner fa-spin text-brand-blue ml-2" aria-hidden="true" />
        </div>
      )}

      {postError && (
        <div className="fixed bottom-5 right-5 z-[90] bg-white rounded-xl shadow-xl border border-brand-red/30 px-4 py-3 flex items-center gap-3 animate-fade-up max-w-xs">
          <i className="fa-solid fa-circle-exclamation text-brand-red" aria-hidden="true" />
          <p className="text-sm text-slate-700 flex-1">{postError}</p>
          <button type="button" onClick={() => setPostError(null)} className="text-slate-400 hover:text-slate-600 shrink-0">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-center relative px-4 py-3 border-b border-slate-200 shrink-0">
              <h2 className="font-display font-bold text-lg text-slate-800">Tạo bài viết</h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Đóng"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-3 space-y-3">
              <div className="flex items-center gap-3">
                {avatar(40)}
                <div>
                  <p className="font-bold text-sm text-slate-800">{currentUser?.name || "Bạn"}</p>
                  <p className="text-xs text-slate-400">Đăng vào {categoryLabel}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {TYPE_KEYS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPostType(key)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition ${
                      postType === key ? "bg-brand-blue text-white" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    <i className={POST_TYPES[key].icon} aria-hidden="true" /> {POST_TYPES[key].label}
                  </button>
                ))}
              </div>

              <input
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Tiêu đề bài viết"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-[16px] font-bold focus:outline-none focus:ring-2 focus:ring-brand-blue/40"
              />

              <HighlightedTextarea
                value={content}
                onChange={setContent}
                onPasteFiles={handlePasteFiles}
                rows={5}
                placeholder="Mô tả... dùng #hashtag để gắn chủ đề (có thể dán ảnh trực tiếp vào đây)"
              />
              {pasteUploading && <p className="text-xs text-slate-400">Đang tải ảnh vừa dán lên...</p>}

              {media.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {media.map((m, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group bg-slate-900">
                      {m.type === "VIDEO" ? (
                        <video src={m.url} className="w-full h-full object-cover" muted />
                      ) : (
                        <Image src={m.url} alt="" fill className="object-cover" />
                      )}
                      <button
                        type="button"
                        onClick={() => setMedia((items) => items.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Xoá ảnh"
                      >
                        <i className="fa-solid fa-xmark" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {error && <p className="text-sm text-brand-red bg-brand-redBg rounded-lg px-3 py-2">{error}</p>}
            </div>

            <div className="px-4 py-3 border-t border-slate-200 shrink-0 space-y-3">
              <div className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="text-sm font-semibold text-slate-600">Thêm vào bài viết của bạn</span>
                {media.length < MAX_MEDIA && (
                  <MediaUploader
                    variant="icon"
                    multiple
                    max={MAX_MEDIA - media.length}
                    onAdd={(item) => setMedia((items) => [...items, item])}
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-brand-blue hover:brightness-95 transition text-white font-bold rounded-xl px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Đăng bài
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
