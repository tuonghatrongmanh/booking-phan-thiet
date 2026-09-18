import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlaceForm from "@/components/admin/PlaceForm";
import PlaceImagesManager from "@/components/admin/PlaceImagesManager";
import SocialCommentsManager from "@/components/admin/SocialCommentsManager";
import ReviewsManager from "@/components/admin/ReviewsManager";
import PlaceBookingOptionsManager from "@/components/admin/PlaceBookingOptionsManager";

export const dynamic = "force-dynamic";

export default async function PlaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      images: true,
      socialComments: { orderBy: { createdAt: "desc" } },
      reviews: { orderBy: { createdAt: "desc" }, include: { images: true } },
      bookingOptions: { orderBy: { sortOrder: "asc" } },
    },
  });
  const [stayTypes, amenities] = await Promise.all([
    prisma.stayTypeSetting.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.stayAmenity.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!place) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">{place.name}</h1>
          <p className="text-slate-400">Quản lý thông tin, ảnh, bằng chứng và đánh giá</p>
        </div>
        <Link href="/admin/places" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
          ← Quay lại danh sách
        </Link>
      </div>

      <PlaceForm initial={{ ...place, amenities: Array.isArray(place.amenities) ? (place.amenities as string[]) : [] }} stayTypes={stayTypes} amenityOptions={amenities.map((a) => a.label)} />
      {place.category === "HOMESTAY" && (
        <PlaceBookingOptionsManager
          placeId={place.id}
          options={place.bookingOptions.map((o) => ({
            id: o.id,
            label: o.label,
            depositVnd: o.depositVnd,
            priceVnd: o.priceVnd,
            maxUnits: o.maxUnits,
            wholeProperty: o.wholeProperty,
          }))}
        />
      )}
      <PlaceImagesManager placeId={place.id} images={place.images} />
      <SocialCommentsManager placeId={place.id} comments={place.socialComments} />
      <ReviewsManager placeId={place.id} reviews={place.reviews} />
    </div>
  );
}
