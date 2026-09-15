import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import { prisma } from "@/lib/prisma";
import { avgOf } from "@/lib/places";
import VehicleListClient from "@/components/car-rental/VehicleListClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thuê xe máy Phan Thiết - Xe số, tay ga, Vision, SH giá tốt | Booking Phan Thiết",
  description: "Thuê xe máy tại Phan Thiết - Mũi Né: xe số 50cc, xe tay ga, Vision, SH, giá ngày thường/ngày lễ rõ ràng, giao nhận tận nơi.",
};

export default async function ThueXePage() {
  const vehicles = await prisma.place.findMany({
    where: { category: "CAR_RENTAL", hidden: false },
    orderBy: { createdAt: "desc" },
    include: { images: true, reviews: { select: { rating: true } } },
  });

  const vehicleData = vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    avatar: v.avatar,
    vehicleType: v.vehicleType,
    priceFromVnd: v.priceFromVnd,
    priceHolidayVnd: v.priceHolidayVnd,
    availableRooms: v.availableRooms,
    totalRooms: v.totalRooms,
    availabilityStatus: v.availabilityStatus,
    createdAt: v.createdAt.toISOString(),
    ratingAverage: avgOf(v.reviews.map((r) => r.rating)),
    ratingTotal: v.reviews.length,
    description: v.description,
    amenities: Array.isArray(v.amenities) ? (v.amenities as string[]) : [],
    openingHours: v.openingHours,
    address: v.address,
    returnLocation: v.returnLocation,
    phone: v.phone,
    mapEmbedUrl: v.mapEmbedUrl,
    images: v.images,
  }));

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />

      <section className="bg-brand-sky/40 py-10">
        <div className="container-custom text-center max-w-2xl mx-auto">
          <h1 className="font-display font-bold text-3xl text-slate-800 mb-2">Thuê xe máy Phan Thiết</h1>
          <p className="text-slate-500 text-sm">
            Xe số, xe tay ga, Vision, SH, cào cào... giá ngày thường/ngày lễ rõ ràng, giao nhận tận nơi
          </p>
        </div>
      </section>

      <Reveal>
        <section className="container-custom py-10">
          {vehicleData.length === 0 ? (
            <p className="text-center text-slate-400 py-16">Chưa có xe cho thuê nào.</p>
          ) : (
            <VehicleListClient vehicles={vehicleData} />
          )}
        </section>
      </Reveal>

      <Footer />
    </div>
  );
}
