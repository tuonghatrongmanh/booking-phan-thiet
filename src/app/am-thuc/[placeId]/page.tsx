import PlaceDetailView from "@/components/places/PlaceDetailView";

export const dynamic = "force-dynamic";

export default async function AmThucDetailPage({ params }: { params: Promise<{ placeId: string }> }) {
  const { placeId } = await params;
  return <PlaceDetailView placeId={placeId} category="RESTAURANT" backHref="/am-thuc" backLabel="Ẩm Thực" />;
}
