const STEPS = [
  { icon: "fa-gamepad", title: "Chọn game", desc: "Chọn game bạn yêu thích trong danh sách." },
  { icon: "fa-play", title: "Chơi và tích xu", desc: "Chơi trong thời gian ngắn, nhận xu ngay." },
  { icon: "fa-coins", title: "Đổi xu", desc: "Dùng xu tích được để đổi phần thưởng." },
  { icon: "fa-gift", title: "Nhận quà", desc: "Nhận voucher/quà và sử dụng ngay!" },
];

// 4 buoc "Cach tham gia" - card trang bo shadow-game-card (dong bo voi cac khoi
// khac trong trang), icon vuong bo tron gradient (thay cho vong tron don gian truoc
// day), so buoc lam watermark lon phia sau cho do "day dac", noi giua cac card bang
// 1 duong ke ngang chay xuyen suot (thay cho tung icon mui ten rieng le).
export default function HowToPlaySteps() {
  return (
    <section className="bg-game-light py-16 lg:py-[72px]">
      <div className="max-w-[1100px] mx-auto px-6">
        <h2 className="font-display font-extrabold text-[28px] sm:text-[32px] text-game-textDark text-center flex items-center justify-center gap-2.5 mb-2">
          <i className="fa-solid fa-flag text-game-primary" aria-hidden="true" /> Cách tham gia
        </h2>
        <p className="text-game-textGray text-center text-base sm:text-lg mb-12">
          Tích lũy xu từ các trò chơi để đổi lấy những phần thưởng hấp dẫn.
        </p>

        <div className="relative">
          <div className="hidden sm:block absolute top-9 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-game-primary/0 via-game-primary/25 to-game-primary/0" />

          <div className="grid sm:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div
                key={s.title}
                className="relative bg-white rounded-3xl shadow-game-card hover:shadow-game-cardHover hover:-translate-y-1 transition-all duration-200 p-6 text-center overflow-hidden"
              >
                <span className="absolute -top-2 -right-1 font-display font-extrabold text-6xl text-game-primary/[0.06] select-none pointer-events-none">
                  {i + 1}
                </span>
                <div
                  className="relative w-[68px] h-[68px] rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl"
                  style={{ background: "linear-gradient(135deg, var(--color-game-primary), var(--color-game-deep))" }}
                >
                  <i className={`fa-solid ${s.icon}`} aria-hidden="true" />
                </div>
                <p className="relative text-xs font-bold text-game-primary uppercase tracking-wide mb-1">Bước {i + 1}</p>
                <p className="relative font-display font-bold text-game-textDark mb-1.5">{s.title}</p>
                <p className="relative text-sm text-game-textGray leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
