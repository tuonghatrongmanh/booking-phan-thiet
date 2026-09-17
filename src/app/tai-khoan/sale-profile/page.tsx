import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth-actor";
import { prisma } from "@/lib/prisma";
import SaleProfileEditor from "@/components/account/SaleProfileEditor";
import { computeSalePoints } from "@/lib/sale-points";

export const dynamic = "force-dynamic";

export default async function SaleProfilePage() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    redirect("/dang-nhap?callbackUrl=/tai-khoan/sale-profile");
  }

  const [saleApplication, place, guideVideos] = await Promise.all([
    prisma.saleApplication.findFirst({ where: { userId: actor.id }, orderBy: { createdAt: "desc" } }),
    prisma.place.findUnique({
      where: { userId: actor.id },
      include: {
        videos: { orderBy: { sortOrder: "asc" } },
        socialComments: { orderBy: { createdAt: "desc" } },
        reviews: { select: { rating: true } },
        standing: { select: { action: true, active: true } },
      },
    }),
    prisma.guideVideo.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!saleApplication || saleApplication.status !== "APPROVED" || !place) {
    redirect("/tai-khoan");
  }

  const { points, missions } = computeSalePoints(place);

  return (
    <SaleProfileEditor
      place={{
        avatar: place.avatar,
        coverImage: place.coverImage,
        name: place.name,
        roleTitle: place.roleTitle,
        slogan: place.slogan,
        description: place.description,
        phone: place.phone,
        workArea: place.workArea,
        yearsExperience: place.yearsExperience,
        clientsServedCount: place.clientsServedCount,
        zaloUrl: place.zaloUrl,
        fanpageUrl: place.fanpageUrl,
        tiktokUrl: place.tiktokUrl,
        youtubeUrl: place.youtubeUrl,
        instagramUrl: place.instagramUrl,
      }}
      videos={place.videos}
      testimonials={place.socialComments}
      guideVideos={guideVideos}
      points={points}
      missions={missions}
    />
  );
}
