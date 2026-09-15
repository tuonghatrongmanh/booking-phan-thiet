import PlaceForm from "@/components/admin/PlaceForm";

export default function NewAttractionPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Thêm địa điểm tham quan</h1>
      <PlaceForm lockCategory="ATTRACTION" />
    </div>
  );
}
