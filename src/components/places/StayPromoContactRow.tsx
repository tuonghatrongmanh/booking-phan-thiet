import StayCountdownBadge from "@/components/places/StayCountdownBadge";

export default function StayPromoContactRow({ phone, zaloUrl }: { phone: string | null; zaloUrl: string | null }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px] gap-4">
      <div className="flex items-center gap-4 bg-[#F0F0FF] rounded-2xl px-5 py-4">
        <span className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-2xl shrink-0 shadow-sm">
          <i className="fa-solid fa-gift text-[#8B5CE0]" aria-hidden="true" />
        </span>
        <p className="text-sm text-[#334D66] leading-relaxed">
          <span className="font-bold text-[#102F4F]">Ưu đãi đặc biệt hôm nay!</span> Liên hệ đặt phòng ngay để được tư vấn giá tốt nhất. Ưu đãi
          có hiệu lực trong <StayCountdownBadge />
        </p>
      </div>

      <div className="bg-white border border-[#E5EDF5] rounded-2xl px-5 py-4 flex flex-col justify-center gap-2">
        <p className="text-xs font-semibold text-[#8298AE]">Liên hệ với chỗ nghỉ</p>
        <div className="flex items-center gap-3">
          {phone && (
            <a href={`tel:${phone}`} className="flex items-center gap-2 text-sm font-bold text-[#102F4F] hover:text-brand-blue transition">
              <i className="fa-solid fa-phone text-brand-blue" aria-hidden="true" /> {phone}
            </a>
          )}
          {zaloUrl && (
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm font-bold text-brand-blue hover:underline"
            >
              <i className="fa-solid fa-comment-sms" aria-hidden="true" /> Nhắn tin qua Zalo
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
