import PlaceForm from "@/components/admin/PlaceForm";

export default function NewCarRentalPage() {
  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-slate-800 mb-6">Thêm xe cho thuê</h1>
      <PlaceForm lockCategory="CAR_RENTAL" />
    </div>
  );
}
