import { prisma } from "@/lib/prisma";
import { enumToSlug } from "@/lib/forum";
import { matchFoodByIntent, type FoodIntentCandidate } from "@/lib/ai-assistant";
import type { Food } from "@prisma/client";

export type SearchResultItem = {
  type: "homestay" | "restaurant" | "news" | "forum";
  id: string;
  title: string;
  subtitle: string | null;
  image: string | null;
  href: string;
};

// Cac Place category da co trang chi tiet that su tren site (Luu tru + Am thuc);
// CAR_RENTAL/ATTRACTION chua co trang rieng nen tam khong dua vao ket qua tim kiem
// de tranh link chet.
const PLACE_BASE_PATH: Partial<Record<string, string>> = {
  HOMESTAY: "/luu-tru",
  RESTAURANT: "/am-thuc",
};

function mapFoodToResult(f: Food): SearchResultItem {
  return {
    type: "restaurant",
    id: f.id,
    title: f.name,
    subtitle: f.description?.slice(0, 100) ?? f.restaurant,
    image: f.image,
    href: `/am-thuc/mon/${f.slug}`,
  };
}

// Tim toan dien tren cac loai noi dung that cua he thong (Place, Food, tin tuc, bai
// cong dong). Food dung chung nhan "restaurant" (Am thuc) voi Place category
// RESTAURANT vi ca 2 cung thuoc khu Am thuc duoi mat khach.
export async function searchSite(query: string): Promise<SearchResultItem[]> {
  // Chuan hoa Unicode ve NFC truoc khi so khop: ban phim tieng Viet tren nhieu he
  // dieu hanh/IME (vd Unikey tren Windows) co the go ra chu co dau o dang NFD (to hop
  // nhieu ky tu, vd "o" + dau mu rieng) trong khi du lieu luu trong DB la NFC (1 ky tu
  // dung san) - nhin giong het nhau tren man hinh nhung khac o cap do byte nen `contains`
  // cua Prisma se khong khop duoc neu khong chuan hoa ve cung 1 dang truoc.
  const q = query.trim().normalize("NFC");
  if (!q) return [];

  const [places, foods, news, posts] = await Promise.all([
    prisma.place.findMany({
      where: {
        category: { in: ["HOMESTAY", "RESTAURANT"] },
        OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { address: { contains: q, mode: "insensitive" } }],
      },
      take: 6,
      orderBy: { featuredRank: "asc" },
      include: { images: { take: 1 } },
    }),
    prisma.food.findMany({
      where: {
        active: true,
        OR: [{ name: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }, { restaurant: { contains: q, mode: "insensitive" } }],
      },
      take: 6,
      orderBy: { sortOrder: "asc" },
    }),
    prisma.news.findMany({
      where: {
        published: true,
        OR: [{ title: { contains: q, mode: "insensitive" } }, { excerpt: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }],
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    prisma.forumPost.findMany({
      where: { OR: [{ title: { contains: q, mode: "insensitive" } }, { content: { contains: q, mode: "insensitive" } }] },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { media: { take: 1 } },
    }),
  ]);

  const placeResults = places
    .filter((p) => PLACE_BASE_PATH[p.category])
    .map((p) => {
      const type: SearchResultItem["type"] = p.category === "HOMESTAY" ? "homestay" : "restaurant";
      return {
        type,
        id: p.id,
        title: p.name,
        subtitle: p.description?.slice(0, 100) ?? p.address,
        image: p.avatar ?? p.images[0]?.url ?? null,
        href: `${PLACE_BASE_PATH[p.category]}/${p.id}`,
      };
    });

  const foodResults = foods.map(mapFoodToResult);

  const newsResults = news.map((n) => ({
    type: "news" as const,
    id: n.id,
    title: n.title,
    subtitle: n.excerpt,
    image: n.coverImage,
    href: `/tin-tuc/${n.slug}`,
  }));

  const forumResults = posts.map((post) => ({
    type: "forum" as const,
    id: post.id,
    title: post.title,
    subtitle: post.content?.slice(0, 100) ?? null,
    image: post.media[0]?.url ?? null,
    href: `/${enumToSlug(post.category)}/${post.id}`,
  }));

  return [...placeResults, ...foodResults, ...newsResults, ...forumResults];
}

// Lop 2 khi tim chu truc tiep (searchSite) khong ra ket qua: khach thuong hoi kieu tu
// nhien/ngu canh (vd "mon an toi nhat dinh phai an la gi", "toi thay ban dang tren
// tiktok mon ngon buoi toi") ma khong go dung ten mon - dua danh sach mon an THAT cho
// Gemini de no "hieu y" roi tra ve dung id, sau do lay lai du lieu that tu DB de hien
// (khong bao gio hien anh/mo ta do AI tu bia). Uu tien mon featured + gioi han so luong
// gui cho Gemini de kiem soat token/chi phi khi du lieu mon an nhieu len sau nay.
const AI_INTENT_CANDIDATE_LIMIT = 80;

export async function searchFoodByAiIntent(query: string): Promise<SearchResultItem[]> {
  const q = query.trim();
  if (!q) return [];

  const candidates = await prisma.food.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
    take: AI_INTENT_CANDIDATE_LIMIT,
  });
  if (candidates.length === 0) return [];

  const intentCandidates: FoodIntentCandidate[] = candidates.map((f) => ({
    id: f.id,
    name: f.name,
    restaurant: f.restaurant,
    description: f.description,
    mealTime: f.mealTime,
    is24h: f.is24h,
    featured: f.featured,
    badge: f.badge,
  }));

  const matchIds = await matchFoodByIntent(q, intentCandidates);
  if (matchIds.length === 0) return [];

  const byId = new Map(candidates.map((f) => [f.id, f]));
  const matched = matchIds.map((id) => byId.get(id)).filter((f): f is Food => Boolean(f));
  return matched.map(mapFoodToResult);
}
