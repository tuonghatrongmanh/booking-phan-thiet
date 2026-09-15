export default function StayQuickInfoBoxes({ petFriendly }: { petFriendly: boolean }) {
  const items = [
    { icon: "fa-regular fa-calendar-check", label: "Nhận phòng", value: "Từ 14:00" },
    { icon: "fa-regular fa-calendar-xmark", label: "Trả phòng", value: "Trước 12:00" },
    { icon: "fa-solid fa-rotate-left", label: "Hủy phòng", value: "Miễn phí hủy trước 2 ngày" },
    { icon: "fa-solid fa-paw", label: "Thú cưng", value: petFriendly ? "Được phép mang theo" : "Không nhận thú cưng" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((it) => (
        <div key={it.label} className="border border-[#E6EEF5] rounded-xl px-3.5 py-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-[#8298AE]">
            <i className={it.icon} aria-hidden="true" /> {it.label}
          </p>
          <p className="text-sm font-bold text-[#102F4F] mt-1">{it.value}</p>
        </div>
      ))}
    </div>
  );
}
