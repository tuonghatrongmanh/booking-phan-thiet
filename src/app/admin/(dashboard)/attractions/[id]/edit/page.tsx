import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlaceForm from "@/components/admin/PlaceForm";
import PlaceImagesManager from "@/components/admin/PlaceImagesManager";
import ReviewsManager from "@/components/admin/ReviewsManager";

export const dynamic = "force-dynamic";

export default async function EditAttractionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attraction = await prisma.place.findUnique({
    where: { id },
    include: { images: true, reviews: { orderBy: { createdAt: "desc" }, include: { images: true } } },
  });
  if (!attraction || attraction.category !== "ATTRACTION") notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-800">Sửa địa điểm tham quan</h1>
        <Link href="/admin/attractions" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
          ← Quay lại danh sách
        </Link>
      </div>
      <PlaceForm
        lockCategory="ATTRACTION"
        initial={{ ...attraction, amenities: Array.isArray(attraction.amenities) ? (attraction.amenities as string[]) : [] }}
      />
      <PlaceImagesManager placeId={attraction.id} images={attraction.images} />
      <ReviewsManager placeId={attraction.id} reviews={attraction.reviews} />
    </div>
  );
}
