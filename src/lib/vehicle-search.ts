// Tìm kiếm + lọc theo ngày cho trang Thuê xe (chạy ở trình duyệt, tách ra đây để kiểm thử được).

// Bỏ dấu tiếng Việt + đ -> d + chữ thường: "Xe số" khớp với "xe so", "Mũi Né" khớp "mui ne"
export function normalizeText(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

export type BookedRange = { from: string; to: string; qty: number };

// Số xe còn trống trong [from, to] (YYYY-MM-DD, 2 đầu tính là ngày thuê) = tổng số xe - số xe đã cọc trùng ngày
export function remainingUnits(v: { totalRooms: number | null; bookedRanges: BookedRange[] }, from: string, to: string): number {
  const stock = Math.max(1, v.totalRooms ?? 1);
  const taken = v.bookedRanges.filter((r) => r.from <= to && r.to >= from).reduce((sum, r) => sum + r.qty, 0);
  return Math.max(0, stock - taken);
}

// Khớp khi ĐỦ TẤT CẢ các từ khóa (đã bỏ dấu) xuất hiện trong chuỗi tìm kiếm của xe
export function matchesTokens(haystack: string, query: string): boolean {
  const tokens = normalizeText(query).split(/\s+/).filter(Boolean);
  return tokens.every((t) => haystack.includes(t));
}
