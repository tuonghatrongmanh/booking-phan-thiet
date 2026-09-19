import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";

// SEO cho các TRANG danh sách (không phải bài chi tiết). Admin sửa ở Admin > SEO các trang;
// chưa sửa thì dùng giá trị mặc định dưới đây.
export type SeoPageDef = { key: string; label: string; defaultTitle: string; defaultDescription: string };

export const SEO_PAGES: SeoPageDef[] = [
  {
    key: "/luu-tru",
    label: "Lưu trú (homestay, villa, resort)",
    defaultTitle: "Lưu trú Phan Thiết - Homestay, Villa, Resort uy tín | Booking Phan Thiết",
    defaultDescription: "Tìm homestay, villa, resort tại Phan Thiết - Mũi Né: giá rõ ràng, đánh giá thật từ khách, xem phòng trống và đặt cọc giữ chỗ nhanh.",
  },
  {
    key: "/thue-xe",
    label: "Thuê xe máy",
    defaultTitle: "Thuê xe máy Phan Thiết - Xe số, tay ga, Vision, SH giá tốt | Booking Phan Thiết",
    defaultDescription: "Thuê xe máy tại Phan Thiết - Mũi Né: xe số, xe tay ga, Vision, SH, giá ngày thường/ngày lễ rõ ràng, giao nhận tận nơi.",
  },
  {
    key: "/am-thuc",
    label: "Ẩm thực",
    defaultTitle: "Ẩm thực Phan Thiết - Quán ăn, đặc sản ngon nên thử | Booking Phan Thiết",
    defaultDescription: "Khám phá quán ăn ngon, đặc sản, hải sản và món nổi tiếng tại Phan Thiết - Mũi Né với đánh giá thật, giá tham khảo và bản đồ chỉ đường.",
  },
  {
    key: "/diem-tham-quan",
    label: "Trải nghiệm & điểm tham quan",
    defaultTitle: "Trải nghiệm & Điểm tham quan Phan Thiết | Booking Phan Thiết",
    defaultDescription: "Khám phá các điểm tham quan, trải nghiệm hấp dẫn tại Phan Thiết - Mũi Né: đồi cát, suối tiên, hải đăng, làng chài, di tích lịch sử...",
  },
  {
    key: "/tin-tuc",
    label: "Blog / Tin tức",
    defaultTitle: "Blog - Khám phá Phan Thiết | Booking Phan Thiết",
    defaultDescription: "Cẩm nang du lịch, kinh nghiệm, địa điểm đẹp, ẩm thực ngon và những trải nghiệm thú vị tại Phan Thiết - Mũi Né.",
  },
  {
    key: "/game-trung-thuong",
    label: "Game trúng thưởng",
    defaultTitle: "Game Trúng Thưởng Phan Thiết | Chơi Game Nhận Xu & Voucher",
    defaultDescription: "Chơi các mini game vui nhộn trên BookingPhanThiet, tích xu và đổi voucher, mã giảm giá cùng nhiều phần thưởng hấp dẫn.",
  },
];

export async function getPageSeo(key: string) {
  const def = SEO_PAGES.find((p) => p.key === key);
  const row = await prisma.pageSeoSetting.findUnique({ where: { key } }).catch(() => null);
  return {
    key,
    metaTitle: row?.metaTitle || def?.defaultTitle || "",
    metaDescription: row?.metaDescription || def?.defaultDescription || "",
    focusKeyword: row?.focusKeyword || "",
  };
}

export async function buildPageMetadata(key: string): Promise<Metadata> {
  const seo = await getPageSeo(key);
  const url = `${SITE_URL}${key}`;
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: seo.metaTitle, description: seo.metaDescription, url, type: "website", locale: "vi_VN" },
  };
}
