// Tiện ích ngày dùng chung cho server component (gọi hàm ở đây thay vì gọi trực tiếp Date.now()
// trong component để giữ component "thuần" theo quy tắc lint của React).

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
