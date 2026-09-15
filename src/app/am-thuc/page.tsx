import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import HeroFood from "@/components/food/HeroFood";
import FoodDiscoverySection from "@/components/food/FoodDiscoverySection";
import PromotionBanner from "@/components/food/PromotionBanner";
import TrustFeatures from "@/components/food/TrustFeatures";
import LocalSpecialties from "@/components/food/LocalSpecialties";
import Reveal from "@/components/home/Reveal";
import { prisma } from "@/lib/prisma";
import { getAmThucBannerSettings } from "@/lib/am-thuc-banner-settings";

export const dynamic = "force-dynamic";

export default async function AmThucPage() {
  const [foods, categories, bannerSettings, specialties] = await Promise.all([
    prisma.food.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.foodCategory.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    getAmThucBannerSettings(),
    prisma.localSpecialty.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div className="bg-food-bg min-h-screen">
      <Header />
      <HeroFood settings={bannerSettings} />
      <Reveal>
        <FoodDiscoverySection
          categories={categories}
          foods={foods}
          sidebar={
            <>
              <PromotionBanner settings={bannerSettings} />
              <TrustFeatures settings={bannerSettings} />
            </>
          }
        />
      </Reveal>
      <Reveal>
        <LocalSpecialties specialties={specialties} />
      </Reveal>
      <Footer />
    </div>
  );
}
