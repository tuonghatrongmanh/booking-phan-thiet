import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import StayDetailView from "@/components/places/StayDetailView";
import { SITE_URL, absoluteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ placeId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { placeId } = await params;
  const place = await prisma.place.findUnique({ where: { id: placeId } });
  if (!place || place.category !== "HOMESTAY") return {};
  // SEO nhập ở Admin (metaTitle/metaDescription), chưa nhập thì dùng tên + mô tả
  const title = place.metaTitle || `${place.name} | Lưu trú Phan Thiết`;
  const description = place.metaDescription || place.description?.slice(0, 160) || undefined;
  const url = `${SITE_URL}/luu-tru/${place.id}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", locale: "vi_VN", ...(place.avatar ? { images: [absoluteUrl(place.avatar)!] } : {}) },
  };
}

export default async function LuuTruDetailPage({ params }: Params) {
  const { placeId } = await params;
  return <StayDetailView placeId={placeId} />;
}
