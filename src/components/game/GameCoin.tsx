// Hien thi "xu" thong nhat kieu cho toan trang Game (icon xu vang + text), dung
// chung cho ca coin-range tren the game va so xu hien co - tranh moi noi tu ve icon
// xu rieng khong dong bo (theo yeu cau spec).
export default function GameCoin({ text, size = "sm" }: { text: string; size?: "sm" | "lg" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold text-game-primary ${
        size === "lg" ? "text-lg" : "text-sm"
      }`}
    >
      <i className="fa-solid fa-coins text-game-yellow" aria-hidden="true" />
      {text}
    </span>
  );
}
