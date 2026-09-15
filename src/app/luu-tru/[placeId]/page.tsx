import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import StayDetailView from "@/components/places/StayDetailView";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ placeId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { placeId } = await params;
  const place = await prisma.place.findUnique({ where: { id: placeId } });
  if (!place || place.category !== "HOMESTAY") return {};
  return {
    title: `${place.name} | Lưu trú Phan Thiết`,
    description: place.description ?? undefined,
  };
}

export default async function LuuTruDetailPage({ params }: Params) {
  const { placeId } = await params;
  return <StayDetailView placeId={placeId} />;
}
