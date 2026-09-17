import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Reveal from "@/components/home/Reveal";
import { prisma } from "@/lib/prisma";
import { avgOf } from "@/lib/places";
import RentalHero from "@/components/car-rental/RentalHero";
import VehicleListClient from "@/components/car-rental/VehicleListClient";
import RentalBenefits from "@/components/car-rental/RentalBenefits";
import RentalSteps from "@/components/car-rental/RentalSteps";
import RentalFAQ from "@/components/car-rental/RentalFAQ";
import RentalCTA from "@/components/car-rental/RentalCTA";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Thuê xe máy Phan Thiết - Xe số, tay ga, Vision, SH giá tốt | Booking Phan Thiết",
  description: "Thuê xe máy tại Phan Thiết - Mũi Né: xe số, xe tay ga, Vision, SH, giá ngày thường/ngày lễ rõ ràng, giao nhận tận nơi.",
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
    brand: v.brand,
    engineCc: v.engineCc,
    transmission: v.transmission,
    seats: v.seats,
    badge: v.badge,
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

      <RentalHero />

      {vehicleData.length === 0 ? (
        <p className="text-center text-slate-400 py-16">Chưa có xe cho thuê nào.</p>
      ) : (
        <VehicleListClient vehicles={vehicleData} />
      )}

      <Reveal>
        <RentalBenefits />
      </Reveal>
      <Reveal>
        <RentalSteps />
      </Reveal>
      <Reveal>
        <RentalFAQ />
      </Reveal>
      <Reveal>
        <RentalCTA />
      </Reveal>

      <Footer />
    </div>
  );
}
