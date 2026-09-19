import { redirect } from "next/navigation";
import { getActor } from "@/lib/auth-actor";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SaleProfilePage() {
  const actor = await getActor();
  if (!actor || actor.type !== "user") {
    redirect("/dang-nhap?callbackUrl=/tai-khoan/sale-profile");
  }

  const [saleApplication, place] = await Promise.all([
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
  ]);

  if (!saleApplication || saleApplication.status !== "APPROVED" || !place) {
    redirect("/tai-khoan");
  }

  // Hồ sơ Sale nay chỉnh sửa ngay trên trang hồ sơ công khai (mục "Khu vực của bạn")
  redirect(`/sale/${place.id}#khu-vuc-cua-ban`);
}
