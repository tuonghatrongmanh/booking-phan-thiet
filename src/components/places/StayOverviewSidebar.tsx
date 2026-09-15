import Link from "next/link";

const WHY_US = [
  { icon: "fa-solid fa-tags", title: "Giá tốt nhất", desc: "Cam kết giá tốt nhất" },
  { icon: "fa-solid fa-bolt", title: "Xác nhận nhanh", desc: "Liên hệ đặt phòng nhanh chóng" },
  { icon: "fa-solid fa-headset", title: "Hỗ trợ 24/7", desc: "Đội ngũ hỗ trợ tận tâm" },
  { icon: "fa-solid fa-star", title: "Đánh giá xác thực", desc: "Tất cả đánh giá đều từ khách thật" },
];

export default function StayOverviewSidebar({
  distanceToBeachM,
  mapEmbedUrl,
}: {
  distanceToBeachM: number | null;
  mapEmbedUrl?: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-[#EFF8FF] rounded-2xl p-5">
        <p className="font-bold text-[#102F4F] mb-3">Vị trí tuyệt vời</p>
        <div className="relative h-28 rounded-xl overflow-hidden bg-white mb-3">
          {mapEmbedUrl ? (
            <iframe
              src={mapEmbedUrl}
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vị trí trên Google Maps"
            />
          ) : (
            <>
              <div className="absolute inset-0 flex items-center justify-center text-[#168BE0]/25">
                <i className="fa-solid fa-map-location-dot text-3xl" aria-hidden="true" />
              </div>
              <i className="fa-solid fa-location-dot text-[#EF4444] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow" aria-hidden="true" />
            </>
          )}
        </div>
        {distanceToBeachM != null && (
          <p className="flex items-center gap-2 text-sm text-[#334D66] mb-1.5">
            <i className="fa-solid fa-umbrella-beach text-[#168BE0] w-4" aria-hidden="true" /> {distanceToBeachM}m đến bãi biển
          </p>
        )}
        <Link href="/luu-tru#kham-pha-phan-thiet" className="text-sm font-semibold text-[#168BE0] hover:underline">
          Xem thêm địa điểm gần đây
        </Link>
      </div>

      <div className="bg-white border border-[#E6EEF5] rounded-2xl p-5">
        <p className="font-bold text-[#102F4F] mb-3">Tại sao chọn chúng tôi?</p>
        <div className="space-y-3">
          {WHY_US.map((w) => (
            <div key={w.title} className="flex items-start gap-3">
              <span className="w-9 h-9 rounded-lg bg-[#EEF8FF] text-[#168BE0] flex items-center justify-center shrink-0">
                <i className={w.icon} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#102F4F]">{w.title}</p>
                <p className="text-xs text-[#8298AE]">{w.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
