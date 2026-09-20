import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import PlaceForm from "@/components/admin/PlaceForm";
import PlaceImagesManager from "@/components/admin/PlaceImagesManager";
import ReviewsManager from "@/components/admin/ReviewsManager";
import { PlaceOwnerPanel } from "@/components/admin/PartnerAdminControls";
import { getCurrentAdmin } from "@/lib/current-admin";

export const dynamic = "force-dynamic";

export default async function EditCarRentalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const vehicle = await prisma.place.findUnique({
    where: { id },
    include: { images: true, reviews: { orderBy: { createdAt: "desc" }, include: { images: true } }, partnerUser: { select: { name: true, email: true } } },
  });
  const isSuper = (await getCurrentAdmin())?.role === "SUPER_ADMIN";
  if (!vehicle || vehicle.category !== "CAR_RENTAL") notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-slate-800">Sửa xe cho thuê</h1>
        <Link href="/admin/car-rentals" className="text-sm font-semibold text-slate-500 hover:text-slate-700">
          ← Quay lại danh sách
        </Link>
      </div>
      <PlaceForm
        lockCategory="CAR_RENTAL"
        initial={{ ...vehicle, amenities: Array.isArray(vehicle.amenities) ? (vehicle.amenities as string[]) : [] }}
      />
      {isSuper && <PlaceOwnerPanel placeId={vehicle.id} current={vehicle.partnerUser} />}
      <PlaceImagesManager placeId={vehicle.id} images={vehicle.images} />
      <ReviewsManager placeId={vehicle.id} reviews={vehicle.reviews} />
    </div>
  );
}
