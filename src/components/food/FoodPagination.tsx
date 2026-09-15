"use client";

// Phan trang dang so, dung chung cho ca luoi mon an va luoi dac san - nhan currentPage
// (1-based) + totalPages, goi onPageChange khi bam. An hoan toan neu chi co 1 trang.
export default function FoodPagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Phân trang">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Trang trước"
        className="w-10 h-10 rounded-full flex items-center justify-center text-food-text disabled:opacity-35 disabled:cursor-not-allowed hover:bg-food-light hover:text-food-primary transition-colors"
      >
        <i className="fa-solid fa-chevron-left text-sm" aria-hidden="true" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
            page === currentPage ? "bg-food-primary text-white" : "text-food-text hover:bg-food-light hover:text-food-primary"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Trang sau"
        className="w-10 h-10 rounded-full flex items-center justify-center text-food-text disabled:opacity-35 disabled:cursor-not-allowed hover:bg-food-light hover:text-food-primary transition-colors"
      >
        <i className="fa-solid fa-chevron-right text-sm" aria-hidden="true" />
      </button>
    </nav>
  );
}
