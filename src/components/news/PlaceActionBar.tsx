"use client";

import SaveArticleButton from "@/components/news/SaveArticleButton";

// Thanh hanh dong ngay duoi anh bia - CHI hien khi bai gan voi 1 Place cu the (can
// so dien thoai/dia chi that de "Goi ngay"/"Chi duong" co y nghia). Sticky o mobile
// (dinh duoi man hinh) vi day la luc nguoi doc de quyet dinh hanh dong nhat.
export default function PlaceActionBar({
  articleId,
  phone,
  address,
  placeName,
}: {
  articleId: string;
  phone: string | null;
  address: string | null;
  placeName: string;
}) {
  const directionsUrl = address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${placeName}, ${address}`)}`
    : null;

  function shareOrScroll() {
    if (navigator.share) {
      navigator.share({ title: placeName, url: window.location.href }).catch(() => {});
    } else {
      document.getElementById("chia-se")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 bg-white shadow-game-card rounded-2xl p-2 mb-4 sm:static sticky bottom-3 z-40 sm:bottom-auto">
      {phone && (
        <a
          href={`tel:${phone}`}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-food-primary text-white font-bold rounded-xl px-3 py-2.5 text-xs sm:text-sm sm:flex-1"
        >
          <i className="fa-solid fa-phone" aria-hidden="true" /> Gọi ngay
        </a>
      )}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-food-light text-food-primary font-bold rounded-xl px-3 py-2.5 text-xs sm:text-sm sm:flex-1"
        >
          <i className="fa-solid fa-diamond-turn-right" aria-hidden="true" /> Chỉ đường
        </a>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-food-light text-food-primary font-bold rounded-xl px-3 py-2.5 text-xs sm:text-sm sm:flex-1">
        <SaveArticleButton articleId={articleId} compact />
      </div>
      <button
        type="button"
        onClick={shareOrScroll}
        className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 bg-food-light text-food-primary font-bold rounded-xl px-3 py-2.5 text-xs sm:text-sm sm:flex-1"
      >
        <i className="fa-solid fa-share-nodes" aria-hidden="true" /> Chia sẻ
      </button>
    </div>
  );
}
