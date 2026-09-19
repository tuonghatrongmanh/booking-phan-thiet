import { prisma } from "@/lib/prisma";
import { computeSalePoints } from "@/lib/sale-points";
import { sumBonus } from "@/lib/sale-tasks";

const PLACE_SELECT_FOR_POINTS = {
  id: true,
  category: true,
  avatar: true,
  coverImage: true,
  roleTitle: true,
  slogan: true,
  workArea: true,
  yearsExperience: true,
  clientsServedCount: true,
  salePoints: true,
  videos: { select: { id: true } },
  socialComments: { select: { id: true } },
  reviews: { select: { rating: true } },
  standing: { select: { action: true, active: true } },
  saleTasks: { select: { status: true, bonusPoints: true } },
} as const;

// Goi (fire-and-forget, khong chan response) sau moi lan sua ho so/video/testimonial/
// danh gia/dinh chi cua 1 Place category SALE, de salePoints luon phan anh dung hien
// trang moi nhat. Khong lam gi neu Place khong phai SALE.
export async function recalcSalePoints(placeId: string): Promise<void> {
  const place = await prisma.place.findUnique({
    where: { id: placeId },
    select: PLACE_SELECT_FOR_POINTS,
  });
  if (!place || place.category !== "SALE") return;

  const { points } = computeSalePoints({ ...place, bonusPoints: sumBonus(place.saleTasks) });
  if (points === place.salePoints) return;

  await prisma.place.update({ where: { id: placeId }, data: { salePoints: points } });
}
