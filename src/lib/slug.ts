// Dung chung cho moi noi can sinh slug SEO-friendly (News, va sau nay Place/Homestay).
export function slugifyBase(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Them -2, -3... neu slug goc da bi trung (kiem tra qua ham exists do noi goi cung cap,
// vi moi model co bang/dieu kien loai tru rieng - VD News loai tru chinh no khi sua bai).
export async function ensureUniqueSlug(base: string, exists: (slug: string) => Promise<boolean>): Promise<string> {
  let candidate = base || "khong-tieu-de";
  let n = 2;
  while (await exists(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}
