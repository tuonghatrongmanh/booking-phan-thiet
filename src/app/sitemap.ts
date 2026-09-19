import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL } from "@/lib/site-url";
import { FORUM_CATEGORIES, enumToSlug } from "@/lib/forum";

// Liet ke toan bo URL cong khai that su co the doc duoc de Google/Bing... crawl+index
// day du va nhanh hon, thay vi phai tu do tim lan tung lien ket - dieu kien can de
// noi dung co co hoi duoc Google AI Overview/Gemini trich dan (xem tra loi cho user).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [foods, homestays, attractions, saleAgents, news, forumPosts] = await Promise.all([
    prisma.food.findMany({ where: { active: true }, select: { slug: true, updatedAt: true } }),
    prisma.place.findMany({ where: { category: "HOMESTAY" }, select: { id: true, updatedAt: true } }),
    prisma.place.findMany({ where: { category: "ATTRACTION" }, select: { id: true, updatedAt: true } }),
    prisma.place.findMany({ where: { category: "SALE" }, select: { id: true, updatedAt: true } }),
    prisma.news.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } }),
    prisma.forumPost.findMany({ select: { id: true, category: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/luu-tru`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/am-thuc`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/diem-tham-quan`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/tin-tuc`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/thue-xe`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/gioi-thieu`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/chinh-sach-bao-mat`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/dieu-khoan`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/khuyen-mai`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/sale`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/game-trung-thuong`, changeFrequency: "weekly", priority: 0.5 },
    ...Object.keys(FORUM_CATEGORIES).map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];

  const foodRoutes: MetadataRoute.Sitemap = foods.map((f) => ({
    url: `${SITE_URL}/am-thuc/mon/${f.slug}`,
    lastModified: f.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const homestayRoutes: MetadataRoute.Sitemap = homestays.map((p) => ({
    url: `${SITE_URL}/luu-tru/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const attractionRoutes: MetadataRoute.Sitemap = attractions.map((p) => ({
    url: `${SITE_URL}/diem-tham-quan/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const saleAgentRoutes: MetadataRoute.Sitemap = saleAgents.map((p) => ({
    url: `${SITE_URL}/sale/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const newsRoutes: MetadataRoute.Sitemap = news.map((n) => ({
    url: `${SITE_URL}/tin-tuc/${n.slug}`,
    lastModified: n.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const forumRoutes: MetadataRoute.Sitemap = forumPosts.map((p) => ({
    url: `${SITE_URL}/${enumToSlug(p.category)}/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...foodRoutes, ...homestayRoutes, ...attractionRoutes, ...saleAgentRoutes, ...newsRoutes, ...forumRoutes];
}
