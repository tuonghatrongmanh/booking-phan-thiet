export const AMENITY_ICONS: Record<string, string> = {
  "Wi-Fi miễn phí": "fa-solid fa-wifi",
  "Hồ bơi": "fa-solid fa-person-swimming",
  "Bãi đỗ xe": "fa-solid fa-square-parking",
  "Bếp chung": "fa-solid fa-kitchen-set",
  "Điều hòa": "fa-solid fa-snowflake",
  "Bữa sáng": "fa-solid fa-mug-saucer",
  "Máy giặt": "fa-solid fa-shirt",
  "BBQ": "fa-solid fa-fire-burner",
};

export const STAY_TYPE_INFO: Record<string, { label: string; icon: string }> = {
  HOMESTAY: { label: "Homestay", icon: "fa-solid fa-house" },
  VILLA: { label: "Villa", icon: "fa-solid fa-hotel" },
  RESORT: { label: "Resort", icon: "fa-solid fa-umbrella-beach" },
  BUNGALOW: { label: "Bungalow", icon: "fa-solid fa-campground" },
  APARTMENT: { label: "Căn hộ", icon: "fa-solid fa-building" },
};

// Cac khu vuc pho bien o Phan Thiet - dung lam bo loc nhanh dang "ban do" don gian
// (khong phai map that, chi la shortcut loc theo dia chi chua ten khu vuc).
export const STAY_AREAS = ["Mũi Né", "Hàm Tiến", "Phú Thủy", "Tiến Thành"];

export function formatPriceVnd(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

// Mo ta ngan (subtitle) cho tung tien ich co dinh - chi la copy UI mo ta chung cho loai
// tien ich do (khong phai du lieu rieng cho tung cho o), dung cho khoi "Tien ich noi bat".
export const AMENITY_SUBTITLE: Record<string, string> = {
  "Wi-Fi miễn phí": "Tốc độ cao",
  "Hồ bơi": "Mở cửa quanh năm",
  "Bãi đỗ xe": "Có chỗ đậu xe riêng",
  "Bếp chung": "Không gian chung thoải mái",
  "Điều hòa": "Tất cả các phòng",
  "Bữa sáng": "Đa dạng món ăn",
  "Máy giặt": "Dịch vụ giặt ủi",
  "BBQ": "Khu vực ngoài trời",
};
