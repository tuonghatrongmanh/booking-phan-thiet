import { prisma } from "@/lib/prisma";
import BrandMarquee from "./BrandMarquee";

// Danh sach logo lay tu Admin > Thuong hieu doi tac thay vi mang file tinh co dinh -
// khong co logo active nao thi khong render gi ca (BrandMarquee lo phan an section).
export default async function TrustedBrandsSection() {
  const logos = await prisma.brandLogo.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (logos.length === 0) return null;

  return <BrandMarquee logos={logos.map((l) => ({ id: l.id, name: l.name, image: l.image, href: l.href }))} />;
}
