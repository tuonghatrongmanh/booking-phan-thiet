
// Cac "vi tri" icon/nut bam admin co the thay bang anh/GIF (Admin > Giao dien & Le hoi).
// mode: "button" = anh THAY CA NUT (nen trong suot, khong con hinh tron/mau nen cu);
//       "icon"   = anh thay bieu tuong ben trong, hinh dang nut giu nguyen;
//       "image"  = anh minh hoa.
export const UI_SLOTS = [
  {
    id: "scroll-top",
    label: "Nút “Lên đầu trang”",
    mode: "button",
    hint: "Ảnh/GIF vuông, nền trong suốt, khoảng 96x96px (ví dụ: chú mòng biển, con sóng).",
    where: "Góc phải dưới, mọi trang",
  },
  {
    id: "ai-robot",
    label: "Robot trợ lý AI (nút chat)",
    mode: "button",
    hint: "PNG/GIF nền trong suốt, tỉ lệ ~ 9:10, rộng khoảng 300px. GIF động rất hợp ở đây.",
    where: "Góc phải dưới, mọi trang (trên nút lên đầu trang)",
  },
  {
    id: "hero-mascot",
    label: "Robot ở ô tìm kiếm AI (trang chủ)",
    mode: "image",
    hint: "PNG/GIF nền trong suốt, tỉ lệ ~ 3:2 (ảnh gốc 1536x1024).",
    where: "Bên trái ô “Tìm kiếm AI” ở đầu trang chủ",
  },
  {
    id: "search-send",
    label: "Biểu tượng nút gửi (ô tìm kiếm AI)",
    mode: "icon",
    hint: "Ảnh vuông nền trong suốt, khoảng 64x64px. Nút tròn xanh vẫn giữ nguyên.",
    where: "Nút gửi trong ô tìm kiếm AI trang chủ",
  },
  {
    id: "login-icon",
    label: "Biểu tượng nút “Đăng nhập”",
    mode: "icon",
    hint: "Ảnh vuông nền trong suốt, khoảng 48x48px.",
    where: "Nút Đăng nhập trên thanh menu",
  },
  {
    id: "game-play-button",
    label: "Nút “CHƠI NGAY” (game trúng thưởng)",
    mode: "button",
    hint: "Ảnh/GIF ngang, tỉ lệ ~ 3.5:1 (khoảng 420x120px), nền trong suốt.",
    where: "Bảng game ở đầu trang chủ",
  },
] as const;

export type UiSlotId = (typeof UI_SLOTS)[number]["id"];
export type UiSlotMap = Partial<Record<UiSlotId, string>>;

export function isUiSlotId(v: string): v is UiSlotId {
  return UI_SLOTS.some((s) => s.id === v);
}

