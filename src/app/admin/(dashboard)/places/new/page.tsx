import { prisma } from "@/lib/prisma";
import PlaceForm from "@/components/admin/PlaceForm";

export default async function NewPlacePage() {
  const [stayTypes, amenities] = await Promise.all([
    prisma.stayTypeSetting.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.stayAmenity.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-1">Thêm địa điểm mới</h1>
      <p className="text-slate-400 mb-6">
        Sau khi tạo, bạn sẽ được chuyển đến trang quản lý để thêm ảnh, bằng chứng mạng xã hội và đánh giá.
      </p>
      <PlaceForm stayTypes={stayTypes} amenityOptions={amenities.map((a) => a.label)} />
    </div>
  );
}
