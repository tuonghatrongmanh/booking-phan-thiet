import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

// GET /api/admin/search?q=... - tim kiem toan cuc trong admin, tra ket qua that tu DB
// theo tung nhom (bai viet, dia diem, thanh vien, sale, bai dang dien dan, danh gia).
export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ groups: [] });

  const [news, places, users, sales, posts, reviews] = await Promise.all([
    prisma.news.findMany({ where: { title: { contains: q, mode: "insensitive" } }, take: 5, select: { id: true, title: true } }),
    prisma.place.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 5, select: { id: true, name: true, category: true } }),
    prisma.user.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 5, select: { id: true, name: true } }),
    prisma.sale.findMany({ where: { title: { contains: q, mode: "insensitive" } }, take: 5, select: { id: true, title: true } }),
    prisma.forumPost.findMany({ where: { title: { contains: q, mode: "insensitive" } }, take: 5, select: { id: true, title: true, category: true } }),
    prisma.review.findMany({ where: { content: { contains: q, mode: "insensitive" } }, take: 5, select: { id: true, content: true, placeId: true } }),
  ]);

  const groups = [
    { label: "Bài viết", items: news.map((n) => ({ id: n.id, title: n.title, href: `/admin/news/${n.id}/edit` })) },
    {
      label: "Địa điểm",
      items: places.map((p) => ({ id: p.id, title: p.name, href: `/admin/places/${p.id}` })),
    },
    { label: "Thành viên", items: users.map((u) => ({ id: u.id, title: u.name, href: `/admin/users` })) },
    { label: "Sale", items: sales.map((s) => ({ id: s.id, title: s.title, href: `/admin/sales/${s.id}/edit` })) },
    {
      label: "Bài đăng diễn đàn",
      items: posts.map((p) => ({ id: p.id, title: p.title, href: `/admin/forum` })),
    },
    {
      label: "Đánh giá",
      items: reviews.map((r) => ({ id: r.id, title: r.content.slice(0, 60), href: `/admin/reviews/${r.id}/edit` })),
    },
  ].filter((g) => g.items.length > 0);

  return NextResponse.json({ groups });
}
