export default function StayFAQ({
  nearBeach,
  distanceToBeachM,
  petFriendly,
}: {
  nearBeach: boolean;
  distanceToBeachM: number | null;
  petFriendly: boolean;
}) {
  const items = [
    {
      q: "Chỗ nghỉ có gần biển không?",
      a:
        distanceToBeachM != null
          ? `Chỗ nghỉ cách bãi biển khoảng ${distanceToBeachM}m${nearBeach ? " — rất gần biển." : "."}`
          : "Chủ nhà chưa cập nhật khoảng cách tới biển, vui lòng liên hệ trực tiếp để biết thêm chi tiết.",
    },
    { q: "Giá phòng đã bao gồm những gì?", a: "Giá hiển thị là giá phòng mỗi đêm, đã bao gồm các tiện nghi cơ bản được liệt kê ở mục Tiện nghi." },
    { q: "Có chỗ đậu xe không?", a: "Vui lòng xem mục Tiện nghi nổi bật ở trên để biết chỗ nghỉ có bãi đỗ xe hay không." },
    { q: "Có cho phép mang thú cưng không?", a: petFriendly ? "Có, chỗ nghỉ này cho phép mang theo thú cưng." : "Chỗ nghỉ này hiện không nhận thú cưng." },
    { q: "Thời gian nhận phòng và trả phòng?", a: "Nhận phòng từ 14:00 và trả phòng trước 12:00 (xem chi tiết ở mục Quy định chỗ nghỉ)." },
  ];

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <details key={item.q} className="group bg-white border border-[#E2EBF3] rounded-xl px-5">
          <summary className="flex items-center justify-between gap-3 py-4 cursor-pointer list-none">
            <span className="font-semibold text-[#102F4F]">{item.q}</span>
            <i className="fa-solid fa-chevron-down text-[#8298AE] text-sm transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <p className="pb-4 text-sm text-[#47647F]">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
