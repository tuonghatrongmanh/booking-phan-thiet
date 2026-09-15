export default function AuthorInfo({ authorName }: { authorName: string }) {
  return (
    <div className="mt-10 flex items-center gap-4 bg-white border border-slate-100 shadow-card rounded-2xl p-5">
      <div className="w-14 h-14 rounded-full bg-brand-sky text-brand-blue flex items-center justify-center text-xl font-display font-bold shrink-0">
        {authorName.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-xs text-slate-400">Viết bởi</p>
        <p className="font-display font-bold text-slate-800">{authorName}</p>
        <p className="text-sm text-slate-500 mt-0.5">
          Đội ngũ biên tập nội dung du lịch Phan Thiết - chia sẻ kinh nghiệm và địa điểm thật, đã được kiểm chứng.
        </p>
      </div>
    </div>
  );
}
