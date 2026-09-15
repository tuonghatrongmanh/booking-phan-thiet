// Illustration RIENG cho tung game, ve bang SVG phan lop (nen trang tri mo nhat +
// vat the chinh co canh/highlight tao cam giac 2.5D + hat trang tri xu/sparkle) -
// dung 1 bo mau + 1 do day net vien (#08345F, 3px) xuyen suot ca 6 game de dong bo
// phong cach, thay cho kieu icon-tren-nen-xanh truoc day. Fallback khi game chua co
// anh icon thuc (Game.image null - xem GameForm.tsx admin).
const STROKE = "#08345F";

function Sparkle({ x, y, s = 7, opacity = 0.9 }: { x: number; y: number; s?: number; opacity?: number }) {
  return (
    <path
      d={`M${x} ${y - s} L${x + s * 0.3} ${y - s * 0.3} L${x + s} ${y} L${x + s * 0.3} ${y + s * 0.3} L${x} ${y + s} L${x - s * 0.3} ${y + s * 0.3} L${x - s} ${y} L${x - s * 0.3} ${y - s * 0.3} Z`}
      fill="#fff"
      opacity={opacity}
    />
  );
}

function MiniCoin({ x, y, r = 9 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r={r} fill="#FFC928" stroke={STROKE} strokeWidth="2" />
      <circle r={r - 3} fill="none" stroke="#FF9F1C" strokeWidth="1.5" opacity="0.7" />
    </g>
  );
}

function LuckyWheel() {
  const colors = ["#FFC928", "#25A9E8", "#FF9F1C", "#1689D8", "#FFC928", "#25A9E8", "#FF9F1C", "#1689D8"];
  return (
    <svg viewBox="0 0 160 140" className="w-[150px] h-[128px]" aria-hidden="true">
      <ellipse cx="80" cy="120" rx="46" ry="8" fill="#08345F" opacity="0.18" />
      <g transform="rotate(-7 80 70)">
        <circle cx="80" cy="76" r="46" fill="#0E6FB8" stroke={STROKE} strokeWidth="3" />
        <g transform="translate(80,68)">
          {colors.map((c, i) => (
            <path key={i} d="M0 0 L44 0 A44 44 0 0 1 31.1 31.1 Z" fill={c} stroke={STROKE} strokeWidth="1.5" transform={`rotate(${i * 45})`} />
          ))}
          <circle r="44" fill="none" stroke={STROKE} strokeWidth="3" />
          <circle r="13" fill="#fff" stroke={STROKE} strokeWidth="3" />
        </g>
        <path d="M50 34 A44 44 0 0 1 60 30" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
      </g>
      <path d="M80 16 L70 30 L90 30 Z" fill={STROKE} />
      <MiniCoin x={132} y={44} r={10} />
      <MiniCoin x={140} y={78} r={7} />
      <MiniCoin x={22} y={92} r={8} />
      <Sparkle x={20} y={40} s={7} />
      <Sparkle x={128} y={112} s={5} opacity={0.8} />
    </svg>
  );
}

function FishingIllustration() {
  return (
    <svg viewBox="0 0 160 140" className="w-[150px] h-[128px]" aria-hidden="true">
      <ellipse cx="78" cy="122" rx="52" ry="9" fill="#08345F" opacity="0.15" />
      <path d="M6 100 Q40 88 78 100 T150 96 V128 H6 Z" fill="#25A9E8" stroke={STROKE} strokeWidth="3" />
      <path d="M6 100 Q40 88 78 100 T150 96" fill="none" stroke="#fff" strokeWidth="3" opacity="0.4" />
      <path d="M120 14 Q95 20 84 52 Q78 70 70 78" fill="none" stroke="#7B4B25" strokeWidth="6" strokeLinecap="round" />
      <path d="M120 14 Q95 20 84 52 Q78 70 70 78" fill="none" stroke={STROKE} strokeWidth="1.4" opacity="0.4" />
      <line x1="70" y1="78" x2="58" y2="96" stroke={STROKE} strokeWidth="2" />
      <g transform="translate(56,86) rotate(-18)">
        <ellipse cx="14" cy="18" rx="26" ry="10" fill="#08345F" opacity="0.12" />
        <path d="M-14 8 Q0 -18 34 -6 Q44 -2 40 10 Q30 22 8 20 Q-8 22 -14 8 Z" fill="#25A9E8" stroke={STROKE} strokeWidth="3" />
        <path d="M-6 10 Q6 2 22 6 Q18 14 2 16 Q-4 15 -6 10 Z" fill="#EAF7FF" />
        <path d="M34 -6 L48 -12 L46 2 Z" fill="#0E6FB8" stroke={STROKE} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="4" cy="0" r="3.4" fill="#fff" stroke={STROKE} strokeWidth="1.5" />
        <circle cx="5" cy="0" r="1.3" fill={STROKE} />
        <path d="M10 10 Q16 14 22 10" stroke={STROKE} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="118" cy="60" r="4" fill="#fff" opacity="0.7" />
      <circle cx="126" cy="48" r="2.6" fill="#fff" opacity="0.6" />
      <MiniCoin x={30} y={58} r={9} />
      <Sparkle x={132} y={90} s={6} opacity={0.85} />
    </svg>
  );
}

function PuzzleIllustration() {
  const tab = "a5 5 0 0 1 0 10";
  return (
    <svg viewBox="0 0 160 140" className="w-[150px] h-[128px]" aria-hidden="true">
      <ellipse cx="80" cy="122" rx="52" ry="8" fill="#08345F" opacity="0.15" />
      <g transform="translate(24,20)">
        <path
          d={`M0 8 h30 ${tab} h30 v30 ${tab} v30 h-30 ${tab} h-30 v-30 ${tab} v-30 Z`}
          fill="#1689D8"
          stroke={STROKE}
          strokeWidth="3"
        />
        <circle cx="38" cy="38" r="10" fill="#FFC928" stroke={STROKE} strokeWidth="2" />
        <path d="M46 34 Q50 30 54 34" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
      <g transform="translate(60,20)">
        <path d={`M0 8 h30 ${tab} h30 v70 h-60 v-30 ${tab} v-30 Z`} fill="#25A9E8" stroke={STROKE} strokeWidth="3" />
        <path d="M4 60 Q20 48 36 58 T56 54" stroke="#fff" strokeWidth="3" fill="none" opacity="0.55" />
      </g>
      <g transform="translate(24,56)">
        <path d={`M0 8 v60 h60 v-60 ${tab} h-30 ${tab} h-30 Z`} fill="#0E6FB8" stroke={STROKE} strokeWidth="3" />
      </g>
      <g transform="translate(118,30) rotate(18)">
        <path d="M0 8 h20 a5 5 0 0 1 0 10 h-20 v-10 a5 5 0 0 1 0 -10z" fill="#8B5CE0" stroke={STROKE} strokeWidth="2.5" />
      </g>
      <g transform="translate(10,96) rotate(-15)">
        <path d="M0 0 h22 v22 h-22 a5 5 0 0 1 0 -10 z" fill="#FF9F1C" stroke={STROKE} strokeWidth="2.5" />
      </g>
      <Sparkle x={136} y={70} s={7} />
      <MiniCoin x={128} y={104} r={8} />
    </svg>
  );
}

function PalmGlyph({ tint = "#0E6FB8" }: { tint?: string }) {
  return (
    <g>
      <rect x="-2" y="0" width="4" height="14" fill="#7B4B25" />
      <path d="M0 0 C-10 -6 -16 -2 -18 4 C-10 2 -4 0 0 0Z" fill={tint} />
      <path d="M0 0 C10 -6 16 -2 18 4 C10 2 4 0 0 0Z" fill={tint} />
      <path d="M0 0 C-6 -10 -2 -16 2 -18 C2 -10 2 -4 0 0Z" fill={tint} />
    </g>
  );
}

function MemoryMatchIllustration() {
  return (
    <svg viewBox="0 0 160 140" className="w-[150px] h-[128px]" aria-hidden="true">
      <ellipse cx="80" cy="122" rx="54" ry="8" fill="#08345F" opacity="0.15" />
      <rect x="14" y="26" width="46" height="60" rx="10" fill="#1689D8" stroke={STROKE} strokeWidth="3" transform="rotate(-8 37 56)" />
      <rect x="98" y="30" width="46" height="60" rx="10" fill="#1689D8" stroke={STROKE} strokeWidth="3" transform="rotate(9 121 60)" />
      <g transform="translate(40,34) rotate(-4)">
        <rect x="0" y="0" width="42" height="58" rx="10" fill="#fff" stroke={STROKE} strokeWidth="3" />
        <g transform="translate(21,36)">
          <PalmGlyph />
        </g>
        <circle cx="21" cy="14" r="7" fill="#FFC928" />
      </g>
      <g transform="translate(78,32) rotate(5)">
        <rect x="0" y="0" width="42" height="58" rx="10" fill="#fff" stroke={STROKE} strokeWidth="3" />
        <g transform="translate(21,36)">
          <PalmGlyph />
        </g>
        <circle cx="21" cy="14" r="7" fill="#FFC928" />
      </g>
      <Sparkle x={80} y={18} s={8} />
      <Sparkle x={128} y={96} s={5} opacity={0.8} />
    </svg>
  );
}

function ClickCollectIllustration() {
  return (
    <svg viewBox="0 0 160 140" className="w-[150px] h-[128px]" aria-hidden="true">
      <ellipse cx="76" cy="122" rx="46" ry="8" fill="#08345F" opacity="0.15" />
      <circle cx="76" cy="66" r="52" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.25" />
      <circle cx="76" cy="66" r="40" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.3" />
      <circle cx="76" cy="66" r="32" fill="#FF9F1C" stroke={STROKE} strokeWidth="3" />
      <circle cx="76" cy="66" r="26" fill="#FFC928" stroke={STROKE} strokeWidth="2.5" />
      <path d="M60 52 Q70 44 80 50" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.55" />
      <circle cx="76" cy="66" r="10" fill="none" stroke="#FF9F1C" strokeWidth="2" opacity="0.8" />
      <g transform="translate(96,90) rotate(-8)">
        <path
          d="M0 0 L0 26 L6 20 L11 30 L17 27 L12 17 L20 17 Z"
          fill="#fff"
          stroke={STROKE}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
      <MiniCoin x={30} y={40} r={9} />
      <MiniCoin x={128} y={38} r={7} />
      <text x="20" y="70" fontSize="13" fontWeight="800" fill="#fff" opacity="0.85">
        +10
      </text>
      <text x="112" y="70" fontSize="11" fontWeight="800" fill="#fff" opacity="0.8">
        +20
      </text>
      <Sparkle x={54} y={30} s={6} />
    </svg>
  );
}

function DailyMissionIllustration() {
  return (
    <svg viewBox="0 0 160 140" className="w-[150px] h-[128px]" aria-hidden="true">
      <ellipse cx="82" cy="122" rx="52" ry="8" fill="#08345F" opacity="0.15" />
      <rect x="16" y="18" width="80" height="86" rx="10" fill="#fff" stroke={STROKE} strokeWidth="3" transform="rotate(-4 56 61)" />
      <g transform="rotate(-4 56 61)">
        <rect x="16" y="18" width="80" height="18" rx="10" fill="#25A9E8" />
        <rect x="16" y="27" width="80" height="9" fill="#25A9E8" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(28,${52 + i * 20})`}>
            <circle r="7" fill="#1ea34c" stroke={STROKE} strokeWidth="1.5" />
            <path d="M-3 0 L-0.5 2.8 L4 -3.5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <rect x="14" y="-3" width="44" height="6" rx="3" fill="#EAF7FF" stroke={STROKE} strokeWidth="1" />
          </g>
        ))}
      </g>
      <g transform="translate(96,70)">
        <ellipse cx="18" cy="52" rx="26" ry="6" fill="#08345F" opacity="0.15" />
        <rect x="0" y="16" width="44" height="34" rx="4" fill="#25A9E8" stroke={STROKE} strokeWidth="3" />
        <rect x="0" y="16" width="44" height="10" fill="#0E6FB8" />
        <rect x="17" y="0" width="10" height="50" fill="#FFC928" stroke={STROKE} strokeWidth="2" />
        <path d="M22 0 Q6 -10 -2 2 Q10 4 22 0Z" fill="#FF9F1C" stroke={STROKE} strokeWidth="2" />
        <path d="M22 0 Q38 -10 46 2 Q34 4 22 0Z" fill="#FF9F1C" stroke={STROKE} strokeWidth="2" />
      </g>
      <MiniCoin x={132} y={40} r={9} />
      <MiniCoin x={20} y={104} r={7} />
      <Sparkle x={70} y={16} s={7} />
    </svg>
  );
}

function DefaultIllustration() {
  return (
    <svg viewBox="0 0 160 140" className="w-[150px] h-[128px]" aria-hidden="true">
      <ellipse cx="80" cy="118" rx="40" ry="8" fill="#08345F" opacity="0.15" />
      <rect x="48" y="46" width="64" height="46" rx="8" fill="#FFC928" stroke={STROKE} strokeWidth="3" />
      <path d="M48 60 Q80 40 112 60" fill="none" stroke="#FF9F1C" strokeWidth="6" strokeLinecap="round" />
      <circle cx="80" cy="42" r="6" fill="#FF9F1C" stroke={STROKE} strokeWidth="2" />
    </svg>
  );
}

const MAP: Record<string, () => ReturnType<typeof LuckyWheel>> = {
  "vong-quay-may-man": LuckyWheel,
  "cau-ca-doi-xu": FishingIllustration,
  "ghep-hinh-du-lich": PuzzleIllustration,
  "tim-cap-hinh-anh": MemoryMatchIllustration,
  "click-nhan-xu": ClickCollectIllustration,
  "nhiem-vu-hang-ngay": DailyMissionIllustration,
};

export default function GameCardIllustration({ slug }: { slug: string }) {
  const Illustration = MAP[slug] ?? DefaultIllustration;
  return <Illustration />;
}
