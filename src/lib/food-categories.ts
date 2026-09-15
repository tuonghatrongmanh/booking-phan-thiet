// Helper dung chung cho trang /am-thuc + admin. Danh muc mon an (FoodCategory) gio
// la du lieu DB (xem model FoodCategory) - cac ham lookup ben duoi nhan mang danh
// muc da fetch san (server/client component tu truy van, khong con import tinh o day).
export function categoryLabel(categories: { id: string; label: string }[], categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.label ?? "Món ăn";
}

export function categoryIcon(categories: { id: string; icon: string }[], categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.icon ?? "fa-solid fa-utensils";
}

export const BADGE_COLOR: Record<string, string> = {
  "Phổ biến": "bg-food-primary",
  "Hải sản": "bg-food-primary",
  "Món nướng": "bg-orange-500",
  "Món lẩu": "bg-food-danger",
  "Đặc sản": "bg-food-success",
  "Món chay": "bg-food-success",
  "Đồ uống": "bg-food-primary",
  "Nhà hàng": "bg-food-navy",
};

export function formatFoodPrice(price: number) {
  return price.toLocaleString("vi-VN") + "đ";
}

export function mapsSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query + ", Phan Thiết")}`;
}
