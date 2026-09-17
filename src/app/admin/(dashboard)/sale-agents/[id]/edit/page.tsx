import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/current-admin";
import { getSectionPermission } from "@/lib/admin-permissions";
import PlaceForm from "@/components/admin/PlaceForm";
import SocialCommentsManager from "@/components/admin/SocialCommentsManager";
import PlaceVideosManager from "@/components/admin/PlaceVideosManager";
import PasswordResetCard from "@/components/admin/PasswordResetCard";
import SaleWarningCard from "@/components/admin/SaleWarningCard";
import SaleStandingManager from "@/components/admin/SaleStandingManager";
import SaleMissionsCard from "@/components/account/SaleMissionsCard";
import { computeSalePoints } from "@/lib/sale-points";

export default async function EditSaleAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const currentAdmin = await getCurrentAdmin();
  if (currentAdmin && currentAdmin.role !== "SUPER_ADMIN") {
    const perm = getSectionPermission(currentAdmin.permissions as never, "sale-agents");
    if (!perm.access) redirect("/admin/news");
  }

  const { id } = await params;
  const agent = await prisma.place.findUnique({
    where: { id },
    include: { videos: { orderBy: { sortOrder: "asc" } }, socialComments: true, standing: true, reviews: { select: { rating: true } } },
  });
  if (!agent || agent.category !== "SALE") notFound();

  const owner = agent.userId ? await prisma.user.findUnique({ where: { id: agent.userId } }) : null;
  const { points, missions } = computeSalePoints(agent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa Sale uy tín</h1>
        <SaleMissionsCard points={points} missions={missions} />
      </div>
      <div>
        <PlaceForm
          lockCategory="SALE"
          initial={{ ...agent, amenities: Array.isArray(agent.amenities) ? (agent.amenities as string[]) : [] }}
        />
      </div>
      <PlaceVideosManager placeId={agent.id} videos={agent.videos} />
      <SocialCommentsManager placeId={agent.id} comments={agent.socialComments} />

      {owner && (
        <>
          <PasswordResetCard resetUrl={`/api/admin/users/${owner.id}/reset-password`} label="Sale này" />
          <SaleWarningCard userId={owner.id} userName={agent.name} warningNote={owner.warningNote} />
        </>
      )}

      <SaleStandingManager
        placeId={agent.id}
        standing={
          agent.standing
            ? {
                action: agent.standing.action,
                reason: agent.standing.reason,
                suspendedUntil: agent.standing.suspendedUntil ? agent.standing.suspendedUntil.toISOString() : null,
                active: agent.standing.active,
                appealText: agent.standing.appealText,
                appealCreatedAt: agent.standing.appealCreatedAt ? agent.standing.appealCreatedAt.toISOString() : null,
                appealStatus: agent.standing.appealStatus,
                appealNote: agent.standing.appealNote,
              }
            : null
        }
      />
    </div>
  );
}
