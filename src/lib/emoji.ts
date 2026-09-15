// Icon "hình ảnh" (không dùng SVG inline) — lấy từ bộ Twemoji qua CDN jsdelivr, dạng PNG.
// Xem: https://github.com/twitter/twemoji
const TWEMOJI_BASE = "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";

export function twemojiUrl(codepoint: string) {
  return `${TWEMOJI_BASE}/${codepoint}.png`;
}

export const ICONS = {
  homestay: twemojiUrl("1f3e0"), // 🏠
  villa: twemojiUrl("1f3e1"), // 🏡
  quanNhau: twemojiUrl("1f37b"), // 🍻
  quanCaPhe: twemojiUrl("2615"), // ☕
  khuDuLich: twemojiUrl("1f334"), // 🌴
  gift: twemojiUrl("1f381"), // 🎁
  robot: twemojiUrl("1f916"), // 🤖
  pin: twemojiUrl("1f4cd"), // 📍
  money: twemojiUrl("1f4b0"), // 💰
  clock: twemojiUrl("1f550"), // 🕐
  headset: twemojiUrl("1f3a7"), // 🎧
  mic: twemojiUrl("1f3a4"), // 🎤
  check: twemojiUrl("2705"), // ✅
  diamond: twemojiUrl("1f48e"), // 💎
  star: twemojiUrl("2b50"), // ⭐
  coin: twemojiUrl("1fa99"), // 🪙
  wave: twemojiUrl("1f44b"), // 👋
  vnFlag: twemojiUrl("1f1fb-1f1f3"), // 🇻🇳
  usFlag: twemojiUrl("1f1fa-1f1f8"), // 🇺🇸
  esFlag: twemojiUrl("1f1ea-1f1f8"), // 🇪🇸
  frFlag: twemojiUrl("1f1eb-1f1f7"), // 🇫🇷
  cnFlag: twemojiUrl("1f1e8-1f1f3"), // 🇨🇳
  jpFlag: twemojiUrl("1f1ef-1f1f5"), // 🇯🇵
  krFlag: twemojiUrl("1f1f0-1f1f7"), // 🇰🇷
  globe: twemojiUrl("1f310"), // 🌐
  sun: twemojiUrl("1f31e"), // 🌞
  person: twemojiUrl("1f464"), // 👤
} as const;
