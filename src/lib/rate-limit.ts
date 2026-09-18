// Giới hạn tần suất request đơn giản, lưu trong bộ nhớ (sliding window).
// Đủ để chặn spam/abuse ở mức ứng dụng cho 1 tiến trình Node.
// Lưu ý: KHÔNG thay thế được bảo vệ DDoS thật (cần CDN/WAF như Cloudflare ở tầng hạ tầng),
// và không chia sẻ trạng thái giữa nhiều instance khi scale ngang (cần Redis cho việc đó).
const buckets = new Map<string, number[]>();

// Dọn bucket cũ định kỳ để tránh rò rỉ bộ nhớ khi chạy lâu dài
const MAX_BUCKETS = 50_000;

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const timestamps = buckets.get(key) ?? [];
  const fresh = timestamps.filter((t) => now - t < windowMs);

  if (fresh.length >= limit) {
    buckets.set(key, fresh);
    return false;
  }

  fresh.push(now);
  buckets.set(key, fresh);

  if (buckets.size > MAX_BUCKETS) {
    const cutoff = now - windowMs;
    for (const [k, v] of buckets) {
      if (v.every((t) => t < cutoff)) buckets.delete(k);
    }
  }

  return true;
}

// ----- Chế độ "chỉ đếm lần THẤT BẠI" (dùng cho đăng nhập) -----
// rateLimit() ở trên tính MỌI lần gọi là 1 lượt nên đăng nhập đúng cũng tốn lượt (đăng
// nhập admin gọi 2 lần: kiểm tra mật khẩu + đăng nhập thật => 1 lần đăng nhập đúng tốn
// 2/5 lượt và lần thử thứ 3 bị chặn dù mã đúng). Ba hàm dưới đây cho phép chỉ ghi nhận
// lần SAI: đăng nhập đúng không tốn lượt nào.
export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const fresh = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  buckets.set(key, fresh);
  return fresh.length >= limit;
}

export function recordFailure(key: string): void {
  const list = buckets.get(key) ?? [];
  list.push(Date.now());
  buckets.set(key, list);
}

export function clearFailures(key: string): void {
  buckets.delete(key);
}
