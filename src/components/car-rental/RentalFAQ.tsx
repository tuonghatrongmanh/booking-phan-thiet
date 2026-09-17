"use client";

import { useState } from "react";

const FAQ = [
  {
    q: "Tôi cần giấy tờ gì để thuê xe?",
    a: "Bạn cần mang CCCD/CMND (hoặc hộ chiếu với khách nước ngoài) và đặt cọc theo quy định của nơi cho thuê.",
  },
  {
    q: "Có giao xe đến khách sạn không?",
    a: "Có, bạn có thể chọn khu vực nhận xe là khách sạn/homestay đang ở trong khu vực Phan Thiết - Mũi Né.",
  },
  {
    q: "Nếu xe hỏng giữa đường thì làm sao?",
    a: "Liên hệ ngay số hotline của nơi cho thuê để được hỗ trợ hoặc đổi xe thay thế.",
  },
  {
    q: "Tôi có thể đổi ngày trả xe không?",
    a: "Có, hãy liên hệ trước ít nhất vài giờ để được sắp xếp, tùy vào tình trạng xe còn lại.",
  },
  {
    q: "Giá thuê có bao gồm xăng không?",
    a: "Không, giá thuê chưa bao gồm nhiên liệu, bạn tự đổ xăng trong quá trình sử dụng.",
  },
  {
    q: "Đặt cọc bao nhiêu tiền?",
    a: "Mức đặt cọc tùy theo từng xe và nơi cho thuê, sẽ được thông báo khi nhân viên liên hệ xác nhận.",
  },
  {
    q: "Tôi có thể hủy yêu cầu đã gửi không?",
    a: "Được, bạn có thể gọi trực tiếp cho nơi cho thuê để hủy hoặc đổi lịch trước khi nhận xe.",
  },
  {
    q: "Xe có bảo hiểm không?",
    a: "Tùy nơi cho thuê, hãy hỏi rõ thông tin bảo hiểm/đền bù khi liên hệ xác nhận đơn.",
  },
];

export default function RentalFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section className="max-w-[900px] mx-auto px-4 py-10 sm:py-14">
      <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-800 text-center mb-8">Câu hỏi thường gặp</h2>
      <div className="space-y-3">
        {FAQ.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={item.q} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-semibold text-slate-800 text-sm sm:text-base">{item.q}</span>
                <i className={`fa-solid fa-chevron-down text-slate-400 text-sm transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {isOpen && <p className="px-4 pb-4 text-sm text-slate-500 leading-relaxed">{item.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
