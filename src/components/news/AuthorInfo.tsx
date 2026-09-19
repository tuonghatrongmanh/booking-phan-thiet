export default function AuthorInfo({ authorName }: { authorName: string }) {
  return (
    <div className="mt-6 flex items-center gap-4 bg-white shadow-game-card rounded-2xl p-5">
      <div className="w-14 h-14 rounded-full bg-food-light text-food-primary flex items-center justify-center text-xl font-display font-bold shrink-0">
        {authorName.charAt(0).toUpperCase()}
      </div>
      <div>
        <p className="text-xs text-food-textMuted">Viết bởi</p>
        <p className="font-display font-bold text-food-text">{authorName}</p>
        <p className="text-sm text-food-textMuted mt-0.5">
          Đội ngũ biên tập nội dung du lịch Phan Thiết - chia sẻ kinh nghiệm và địa điểm thật, đã được kiểm chứng.
        </p>
      </div>
    </div>
  );
}
