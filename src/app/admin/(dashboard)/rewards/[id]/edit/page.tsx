import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import RewardForm from "@/components/admin/RewardForm";

export default async function EditRewardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reward = await prisma.rewardItem.findUnique({ where: { id } });
  if (!reward) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Sửa phần thưởng</h1>
      <RewardForm initial={reward} />
    </div>
  );
}
