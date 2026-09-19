import { SEO_PAGES } from "@/lib/page-seo";
import { prisma } from "@/lib/prisma";
import PageSeoManager from "@/components/admin/PageSeoManager";

export const dynamic = "force-dynamic";

export default async function AdminPageSeoPage() {
  const rows = await prisma.pageSeoSetting.findMany();
  const custom = new Map(rows.map((r) => [r.key, r]));

  const pages = SEO_PAGES.map((p) => {
    const row = custom.get(p.key);
    return {
      key: p.key,
      label: p.label,
      defaultTitle: p.defaultTitle,
      defaultDescription: p.defaultDescription,
      metaTitle: row?.metaTitle ?? "",
      metaDescription: row?.metaDescription ?? "",
      focusKeyword: row?.focusKeyword ?? "",
    };
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display font-bold text-2xl text-slate-800">SEO các trang chính</h1>
        <p className="text-slate-400">
          Tiêu đề, mô tả và từ khóa của các trang danh sách (Thuê xe, Lưu trú, Ẩm thực...) hiển thị trên Google. SEO của từng
          bài chi tiết (địa điểm, món ăn, tin tức) nhập ngay trong form sửa của bài đó.
        </p>
      </div>
      <PageSeoManager pages={pages} />
    </div>
  );
}
