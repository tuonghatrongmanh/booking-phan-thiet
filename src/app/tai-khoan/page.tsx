import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileView from "@/components/account/ProfileView";

const EDIT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export default async function AccountPage() {
  const session = await auth();
  const isUser = (session?.user as { type?: string } | undefined)?.type === "user";

  if (!session?.user || !isUser) {
    redirect("/dang-nhap?callbackUrl=/tai-khoan");
  }

  const userId = (session!.user as { id: string }).id;
  const [user, saleApplication] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.saleApplication.findFirst({ where: { userId }, orderBy: { createdAt: "desc" }, select: { status: true, note: true } }),
  ]);
  if (!user) redirect("/dang-nhap");

  let daysLeft = 0;
  if (user!.lastEditedAt) {
    const elapsed = Date.now() - user!.lastEditedAt.getTime();
    if (elapsed < EDIT_COOLDOWN_MS) {
      daysLeft = Math.ceil((EDIT_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
    }
  }

  return (
    <ProfileView
      user={{
        name: user!.name,
        phone: user!.phone,
        email: user!.email,
        dob: user!.dob ? user!.dob.toISOString().slice(0, 10) : null,
        avatar: user!.avatar,
        warningNote: user!.warnedAt ? user!.warningNote : null,
      }}
      daysLeft={daysLeft}
      saleApplication={saleApplication}
    />
  );
}
