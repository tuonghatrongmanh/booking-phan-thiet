import type { MetadataRoute } from "next";

// Cho phép cài website như một ứng dụng (Thêm vào màn hình chính): mở toàn màn hình, có biểu tượng riêng.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Booking Phan Thiết",
    short_name: "BookingPT",
    description: "Tra cứu, đánh giá homestay, sale, thuê xe uy tín tại Phan Thiết - bởi cộng đồng, vì cộng đồng.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    lang: "vi",
    background_color: "#003b95",
    theme_color: "#003b95",
    categories: ["travel", "lifestyle"],
    icons: [
      { src: "/images/favicon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/images/favicon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/images/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/images/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Lưu trú", url: "/luu-tru", icons: [{ src: "/images/favicon-192.png", sizes: "192x192" }] },
      { name: "Thuê xe", url: "/thue-xe", icons: [{ src: "/images/favicon-192.png", sizes: "192x192" }] },
      { name: "Ẩm thực", url: "/am-thuc", icons: [{ src: "/images/favicon-192.png", sizes: "192x192" }] },
      { name: "Tra cứu đặt chỗ", url: "/tra-cuu-dat-cho", icons: [{ src: "/images/favicon-192.png", sizes: "192x192" }] },
    ],
  };
}
